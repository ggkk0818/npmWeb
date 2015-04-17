define([
  'angular',
  'app',
  'lodash'
],
function (angular, app, _) {
    'use strict';

    angular
      .module('app.directives')
      .directive('date', function ($compile, $window) {
          return {
              restrict: 'C',
              link: function ($scope, elem) {
                  elem.datetimepicker();
              }
          };
      });
});