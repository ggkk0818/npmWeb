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
                    return config;
                },
                requestError: function (rejection) {
                    return rejection;
                },
                response: function (response) {
                    if (response && response.headers("Location")) {
                        var respLocation = response.headers("Location");
                        if (respLocation && respLocation.indexOf("login.html") == respLocation.length - 10) {
                            window.location.href = "login.html";
                        }
                    }
                    return response;
                },
                responseError: function (rejection) {
                    return rejection;
                }
            };
        });
    }]);
});