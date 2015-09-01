define([
  'angular',
  'app',
  'lodash'
],
function (angular, app, _) {
    'use strict';

    angular
      .module('app.directives')
      .directive('networkPerspectiveServiceRecord', function ($compile, $window, $timeout) {
          return {
              restrict: 'C',
              link: function ($scope, elem) {
                  var render = function () {
                      if (!$scope.service || !$scope.service.metric)
                          return;
                      var singleLineChartProp = ["flowRatio", "timeConnDuration", "connRatio", "connRequestRatio"];
                      if ($scope.service.metric.time) {
                          for (var i = 0; i < $scope.service.metric.time.length; i++) {
                              if (typeof $scope.service.metric.time[i] === "number")
                                  $scope.service.metric.time[i] = new Date($scope.service.metric.time[i]);
                          }
                      }
                      for (var index in singleLineChartProp) {
                          var prop = singleLineChartProp[index];
                          if ($scope.service.metric[prop]) {
                              var chartData = [];
                              for (var i = 0; i < $scope.service.metric[prop].length; i++) {
                                  if (!$scope.service.metric.time || i >= $scope.service.metric.time.length)
                                      break;
                                  chartData.push({ time: $scope.service.metric.time[i], value: $scope.service.metric[prop][i] });
                              }
                              MG.data_graphic({
                                  data: chartData,
                                  full_width: true,
                                  height: 120,
                                  right: 20,
                                  top: 17,
                                  mouseover: function (d, i) {
                                      //custom format the rollover text, show days
                                      var str = (d.time instanceof Date ? d.time.Format("hh:mm:ss") + " " : "") + (d.value || 0) + "个";
                                      elem.find("[data-type=" + prop + "] svg .mg-active-datapoint").html(str);
                                  },
                                  target: elem.find("[data-type=" + prop + "]").get(0),
                                  x_accessor: 'time',
                                  y_accessor: 'value'
                              });
                          }
                      }
                  };
                  $scope.$watch(function () {
                      var str = "";
                      if ($scope.service.metric && $scope.service.metric.time) {
                          for (var i = 0; i < $scope.service.metric.time.length; i++) {
                              str += new String($scope.service.metric.time[i]);
                          }
                      }
                      return str;
                  }, function () {
                      render();
                  });
              }
          };
      });
});