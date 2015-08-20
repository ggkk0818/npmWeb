define([
  'angular',
  'app',
  'lodash'
],
function (angular, app, _) {
    'use strict';

    angular
      .module('app.directives')
      .directive('flowDetailRatioChart', function ($compile, $window, $timeout) {
          return {
              restrict: 'C',
              link: function ($scope, elem) {
                  var render = function () {
                      var record = $scope.record,
                          config = {
                              circleColor: "#D4AB6A",
                              textColor: "#553300",
                              waveTextColor: "#805615",
                              waveColor: "#AA7D39",
                              circleThickness: 0.1,
                              circleFillGap: 0.2,
                              textVertPosition: 0.8,
                              waveAnimateTime: 2000,
                              waveHeight: 0.3,
                              waveCount: 1
                          };
                      $(elem).attr("id", $scope.$id);
                      loadLiquidFillGauge($scope.$id, record.flowRatio || 0, $.extend(liquidFillGaugeDefaultSettings(), config));
                  };
                  $timeout(function () {
                      render();
                  });
              }
          };
      });
});