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
                url: 'statistics/detail/show',
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

        this.showTopology8583 = function (params, callback) {
            $http({
                method: 'GET',
                url: 'statistics/8583/show',
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

        this.showTopology20022 = function (params, callback) {
            $http({
                method: 'GET',
                url: 'statistics/20022/show',
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

        this.showTopologyHttp = function (params, callback) {
            $http({
                method: 'GET',
                url: 'statistics/http/show',
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

        this.showTopologyMysql = function (params, callback) {
            $http({
                method: 'GET',
                url: 'statistics/mysql/show',
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