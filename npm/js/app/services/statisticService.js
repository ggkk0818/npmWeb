define([
  'angular',
  'jquery',
  'lodash',
  'config'
],
function (angular, $, _, config) {
    'use strict';
    var module = angular.module('app.services');
    module.service('statisticService', function ($routeParams, $http, $rootScope) {
        //统计数据查询
        this.list = function (params, callback) {
            $http({
                method: 'GET',
                url: 'statistics/detail',
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

        this.showTopology = function (params, callback) {
            $http({
                method: 'GET',
                url: 'statistics/topology',
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

        this.showDevice = function (params, callback) {
            $http({
                method: 'GET',
                url: 'statistics/device',
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

        this.ipTopology = function (params, callback) {
            $http({
                method: 'GET',
                url: 'statistics/ip/topology',
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

        this.relationTopology = function (params, callback) {
            $http({
                method: 'GET',
                url: 'statistics/ip/relation',
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