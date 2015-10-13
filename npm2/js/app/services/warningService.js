define([
  'angular',
  'jquery',
  'lodash',
  'config'
],
function (angular, $, _, config) {
    'use strict';
    var module = angular.module('app.services');
    module.service('warningService', function ($routeParams, $http, $rootScope, $interval) {
        //未读告警数量
        $rootScope.unreadWarnCount = 0;
        //查询未读告警
        var thiz = this;
        this.queryUnreadWarnCount = function (callback) {
            $http({
                method: 'GET',
                url: 'warning/count',
                cache: false
            }).success(function (data, status, headers, config) {
                if (typeof callback === "function")
                    callback(data);
                if (data && typeof data.count === "number") {
                    $rootScope.unreadWarnCount = data.count;
                }
            }).error(function (data, status, headers, config) {
                if (typeof callback === "function")
                    callback(null);
                else
                    console.warn("获取未读告警数量失败。" + status);
            });
        };
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
                thiz.queryUnreadWarnCount();
            }).error(function (data, status, headers, config) {
                if (typeof callback === "function")
                    callback(null);
            });
        };
        // 协议告警查询
        this.protocol = function (params, callback) {
            $http({
                method: 'GET',
                url: 'warning/protocol',
                params: params,
                cache: false
            }).success(function (data, status, headers, config) {
                if (typeof callback === "function")
                    callback(data);
                thiz.queryUnreadWarnCount();
            }).error(function (data, status, headers, config) {
                if (typeof callback === "function")
                    callback(null);
            });
        };
        //定时查询未读告警
        $interval(function () {
            thiz.queryUnreadWarnCount();
        }, 70000);
        this.queryUnreadWarnCount();
    });
});