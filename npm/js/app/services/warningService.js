define([
  'angular',
  'jquery',
  'lodash',
  'config'
],
function (angular, $, _, config) {
    'use strict';
    var module = angular.module('app.services');
    module.service('warningService', function ($routeParams, $http, $rootScope) {
        //告警数据查询
        this.list = function (params, callback) {
            $http({
                method: 'GET',
                url: 'warning/show',
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
        //告警按ip分组统计
        this.showDevice = function (params, callback) {
            $http({
                method: 'GET',
                url: 'warning/device',
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
        //告警中心
        this.curve = function (params, callback) {
            $http({
                method: 'GET',
                url: 'warning/curve',
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