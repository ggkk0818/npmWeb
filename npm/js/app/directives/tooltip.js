define([
  'angular',
  'app',
  'lodash'
],
function (angular, app, _) {
    'use strict';

    angular
      .module('app.directives')
      .directive('toggle', function ($compile, $window) {
          return {
              restrict: 'A',
              link: function ($scope, elem, attr) {
                  if (attr.toggle == "tooltip") {
                      $scope.$watch(function () { return attr.title; }, function () {
                          if (attr.title)
                              elem.tooltip();
                          else
                              elem.tooltip('destroy');
                      });
                  }
              }
          };
      });
});