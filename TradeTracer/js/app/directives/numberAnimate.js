define([
  'angular',
  'app',
  'lodash'
],
function (angular, app, _) {
    'use strict';

    angular
      .module('app.directives')
      .directive('numberAnimate', function ($compile, $window, $timeout) {
          return {
              restrict: 'A',
              link: function ($scope, elem, attr) {
                  $timeout(function () {
                      elem.numberAnimate();
                      $scope.$watch(function () {
                          return attr.numberanimateValue;
                      }, function () {
                          elem.numberAnimate("set", attr.numberanimateValue);
                      });
                  });
              }
          };
      });
});