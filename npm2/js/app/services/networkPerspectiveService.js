define([
  'angular',
  'jquery',
  'lodash',
  'config'
],
function (angular, $, _, config) {
    'use strict';
    var module = angular.module('app.services');
    module.service('networkPerspectiveService', function ($http, $rootScope, $interval) {
        //基础指标
        this.basic = function (params, callback) {
            $http({
                method: 'GET',
                url: 'perspective/basic',
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
        //开启协议列表
        this.openService = function (params, callback) {
            $http({
                method: 'GET',
                url: 'perspective/open/service',
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
        //开启协议统计信息
        this.openServiceMetric = function (params, callback) {
            $http({
                method: 'GET',
                url: 'perspective/open/service/metric',
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
        //开启协议流量占比
        this.openServiceRatio = function (params, callback) {
            $http({
                method: 'GET',
                url: 'perspective/open/service/ratio',
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
        //使用的协议列表
        this.usageService = function (params, callback) {
            $http({
                method: 'GET',
                url: 'perspective/usage/service',
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
        //使用的协议统计信息
        this.usageServiceMetric = function (params, callback) {
            $http({
                method: 'GET',
                url: 'perspective/usage/service/metric',
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
        //使用的协议流量占比
        this.usageServiceRatio = function (params, callback) {
            $http({
                method: 'GET',
                url: 'perspective/usage/service/ratio',
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
    });
});