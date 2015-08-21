define([
  'angular',
  'app',
  'lodash'
],
function (angular, app, _) {
    'use strict';

    angular
      .module('app.directives')
      .directive('rangeSlider', function ($compile, $window) {
          return {
              restrict: 'C',
              link: function ($scope, elem, attr) {
                  var render = function () {
                      var onValuesChanging = function (e, data) {
                          $scope.$apply(function () {
                              $scope.$emit("rangeSlideValuesChanging", $scope, elem, e, data);
                          });
                      };
                      var onValuesChanged = function (e, data) {
                          $scope.$apply(function () {
                              $scope.$emit("rangeSlideValuesChanged", $scope, elem, e, data);
                          });
                      };
                      var config = null;
                      if (attr.type == "date") {
                          var min = attr.min ? new Date(attr.min.replace(/-/g, "/")) : new Date(),
                              max = attr.max ? new Date(attr.max.replace(/-/g, "/")) : new Date(),
                              start = attr.start ? new Date(attr.start.replace(/-/g, "/")) : null,
                              end = attr.end ? new Date(attr.end.replace(/-/g, "/")) : null;
                          config = {
                              bounds: {
                                  min: min,
                                  max: max
                              },
                              formatter: function (val) {
                                  var str = null;
                                  if (typeof val === "number") {
                                      str = new Date(val).Format("hh:mm:ss");
                                  }
                                  else if (val instanceof Date) {
                                      str = val.Format("hh:mm:ss");
                                  }
                                  return str;
                              }
                          };
                          if (start instanceof Date || end instanceof Date) {
                              config.defaultValues = {};
                              if (start)
                                  config.defaultValues.min = start;
                              if (end)
                                  config.defaultValues.max = end;
                          }
                      }
                      else {
                          var min = attr.min ? parseInt(attr.min, 10) : 0,
                              max = attr.max ? parseInt(attr.max, 10) : 24,
                              start = attr.start ? parseInt(attr.start, 10) : null,
                              end = attr.end ? parseInt(attr.end, 10) : null;
                          config = {
                              range: {
                                  min: { hours: min },
                                  max: { hours: max }
                              }
                          };
                          if (typeof start == "number" || typeof end == "number") {
                              config.defaultValues = {};
                              if (typeof start == "number")
                                  config.defaultValues.min = start;
                              if (typeof end == "number")
                                  config.defaultValues.max = end;
                          }
                      }
                      $(elem).off("valuesChanging valuesChanged")
                          .on("valuesChanging", onValuesChanging)
                          .on("valuesChanged", onValuesChanged)
                          .dateRangeSlider(config);
                  };
                  //控件渲染监视器
                  $scope.$watch(function () {
                      return attr.type + attr.min + attr.max + attr.start + attr.end;
                  }, function () {
                      render();
                  });
              }
          };
      });
});