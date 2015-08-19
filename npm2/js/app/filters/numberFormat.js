define([
  'angular',
  'app',
  'lodash'
],
function (angular, app, _) {
    'use strict';

    angular.module('app.filters').filter('numberFormat', function () {
        return function (input, n) {
            if (typeof input !== "undefined") {
                var len = input.toString().length;
                while (len < n) {
                    input = "0" + input;
                    len++;
                }
            }
            return input;
        };
    });
});