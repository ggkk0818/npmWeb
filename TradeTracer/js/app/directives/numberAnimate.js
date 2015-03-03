define([
  'angular',
  'app',
  'lodash'
],
function (angular, app, _) {
    'use strict';

    angular
      .module('app.directives')
      .directive('numberAnimate', function ($compile, $window) {
          return {
              restrict: 'A',
              link: function ($scope, elem) {
                  elem.numberAnimate();
              }
          };
      });
});