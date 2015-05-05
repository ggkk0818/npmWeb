define([
        'angular',
        'jquery',
        'lodash',
        'config'
    ],
    function (angular, $, _, config) {
        'use strict';
        var module = angular.module('app.services');
        module.service('protocolChartService', function ($routeParams, $http, $rootScope) {
            this.flowList = function (params, callback) {
                $http({
                    method: 'GET',
                    url: './statistics/chart/flow',
                    params: params,
                    cache: false
                }).success(function (data, status, headers, config) {
                    if (typeof callback === "function")
                        callback(data);
                }).error(function (data, status, headers, config) {
                    if (typeof callback === "function")
                        callback(null);
                });
            };

            this.codeList = function (params, callback) {
                $http({
                    method: 'GET',
                    url: './statistics/chart/code',
                    params: params,
                    cache: false
                }).success(function (data, status, headers, config) {
                    if (typeof callback === "function")
                        callback(data);
                }).error(function (data, status, headers, config) {
                    if (typeof callback === "function")
                        callback(null);
                });
            };

            this.warnList = function (params, callback) {
                $http({
                    method: 'GET',
                    url: './warning/show',
                    params: params,
                    cache: false
                }).success(function (data, status, headers, config) {
                    if (typeof callback === "function")
                        callback(data);
                }).error(function (data, status, headers, config) {
                    if (typeof callback === "function")
                        callback(null);
                });
            };
        })
    }
);

