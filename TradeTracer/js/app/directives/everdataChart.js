define([
  'angular',
  'app',
  'lodash',
  'require',
  'jquery'
],
function (angular, app, _, require, $) {
    'use strict';

    angular
      .module('app.directives')
      .directive('everdataChart', function ($compile, $window) {
          return {
              restrict: 'A',
              link: function ($scope, elem, attr) {
                  var chartScope = $scope.$new();
                  var chartData = null,
                      chartFields = null,
                      chartConfig = null;
                  function loadModule($module) {
                      $module.appendTo(elem.html(""));
                      $compile(elem.contents())($scope.$new());
                      chartScope = getChartScope($module);
                      //chartScope.$digest();
                      elem.removeClass("ng-cloak");
                      if (chartConfig != null)
                          updateChartConfig();
                      //有数据时直接加载
                      if (chartData != null)
                          updateChart();
                  }
                  var initChart = function (type) {
                      require([
                        'jquery',
                        'text!panels/chart/' + type + '/module.html'
                      ], function ($, moduleTemplate) {
                          var $module = $(moduleTemplate);
                          // top level controllers
                          var $controllers = $module.filter('ngcontroller, [ng-controller], .ng-controller');
                          // add child controllers
                          $controllers = $controllers.add($module.find('ngcontroller, [ng-controller], .ng-controller'));

                          if ($controllers.length) {
                              require([
                                'panels/chart/' + type + '/module'
                              ], function () {
                                  loadModule($module);
                              });
                          } else {
                              loadModule($module);
                          }
                      }, function (err) {
                          elem.html($('<div class="alert alert-warning" style="margin:30px 30px 0;"><i class="icon-alert"></i>图表加载失败。<a href="javascript:void(0);">重试</a></div>').find("a").click(function () { initChart(type); }).end());
                      });
                  };
                  //更新图表配置
                  var updateChartConfig = function () {
                      if (chartConfig && typeof chartScope.updateConfig === "function") {
                          chartScope.updateConfig(chartConfig);
                      }
                  };
                  //更新图表数据
                  var updateChart = function () {
                      if (typeof chartScope.update === "function") {
                          chartScope.update(chartData, chartFields);
                      }
                  };
                  //获取图表scope
                  var getChartScope = function (el) {
                      if (el.filter('ngcontroller, [ng-controller], .ng-controller').length)
                          return el.scope();
                      else {
                          var childs = el.find('ngcontroller, [ng-controller], .ng-controller');
                          if (childs.length) {
                              return childs.first().scope();
                          }
                          else {
                              return null;
                          }
                      }
                  };
                  //数据更新事件
                  elem.on("chartupdate", function (e, data, fields) {
                      chartData = data;
                      chartFields = fields;
                      updateChart();
                  });
                  //配置更新事件
                  elem.on("configchange", function (e, config) {
                      chartConfig = config;
                      updateChartConfig();
                  });
                  //刷新事件
                  elem.on("reflow", function (e, data, fields) {
                      if (typeof chartScope.reflow === "function") {
                          chartScope.reflow();
                      }
                  });
                  elem.on("typechange", function (e, type) {
                      if (type)
                          initChart(type);
                  });
                  if (attr.everdataChart)
                      initChart(attr.everdataChart);
              }
          };
      });
});