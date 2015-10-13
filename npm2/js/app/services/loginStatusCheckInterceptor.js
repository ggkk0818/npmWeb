define([
  'angular',
  'jquery',
  'lodash',
  'config'
],
function (angular, $, _, config) {
    'use strict';
    var module = angular.module('app');
    module.config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push(function ($q, $rootScope) {
            return {
                request: function (config) {
                    if (!config.headers)
                        config.headers = {};
                    config.headers["X-Requested-With"] = "XMLHttpRequest";
                    return config;
                },
                requestError: function (rejection) {
                    return rejection;
                },
                response: function (response) {
                    return response;
                },
                responseError: function (response) {
                    if (response && response.status == 401) {
                        window.location.href = "login.html";
                    }
                    return response;
                }
            };
        });
    }]);
});