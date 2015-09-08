define([
  'angular',
  'jquery',
  'lodash',
  'config'
],
function (angular, $, _, config) {
    'use strict';
    var module = angular.module('app.services');
    module.service('networkOverviewService', function ($http, $rootScope, $interval) {
        this.serviceIp = function (params, callback) {
            $http({
                method: 'GET',
                url: 'overview/service/ip',
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
        this.protocol = function (params, callback) {
            $http({
                method: 'GET',
                url: 'overview/protocol',
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
        this.system = function (params, callback) {
            $http({
                method: 'GET',
                url: 'overview/system',
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

        /**
         * 流量、数据包折线图
         */
        this.flow = function (params, callback) {
            $http({
                method: 'GET',
                url: 'overview/flow',
                params: params,
                cache: false
            }).success(function (data, status, headers, config) {
                if (typeof callback === "function")
                    callback(data);
            }).error(function (data, status, headers, config) {
                if (typeof callback === "function")
                    callback(data);
            });
        };

        /**
         * IP TOP 10
         */
        this.ipTopTen = function (params, callback) {
            $http({
                method: 'GET',
                url: 'overview/top/ip',
                params: params,
                cache: false
            }).success(function (data, status, headers, config) {
                if (typeof callback === "function")
                    callback(data);
            }).error(function (data, status, headers, config) {
                if (typeof callback === "function")
                    callback(data);
            });
        };

        /**
         * PORT TOP 10
         */
        this.portTopTen = function (params, callback) {
            $http({
                method: 'GET',
                url: 'overview/top/port',
                params: params,
                cache: false
            }).success(function (data, status, headers, config) {
                if (typeof callback === "function")
                    callback(data);
            }).error(function (data, status, headers, config) {
                if (typeof callback === "function")
                    callback(data);
            });
        };

        /**
         * PROTOCOL TOP 10
         */
        this.protocolTopTen = function (params, callback) {
            $http({
                method: 'GET',
                url: 'overview/top/protocol',
                params: params,
                cache: false
            }).success(function (data, status, headers, config) {
                if (typeof callback === "function")
                    callback(data);
            }).error(function (data, status, headers, config) {
                if (typeof callback === "function")
                    callback(data);
            });
        };
    });
});