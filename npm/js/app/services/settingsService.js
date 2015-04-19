define([
  'angular',
  'jquery',
  'lodash',
  'config'
],
function (angular, $, _, config) {
    'use strict';
    var module = angular.module('app.services');
    module.service('settingsService', function ($routeParams, $http, $rootScope) {
        //告警阈值
        this.thresholdList = function (params, callback) {
            $http({
                method: 'GET',
                url: 'warning/threshold/list',
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
        this.thresholdSave = function (params, callback) {
            $http({
                method: 'GET',
                url: 'warning/threshold/add',
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
        this.thresholdUpdate = function (params, callback) {
            $http({
                method: 'GET',
                url: 'warning/threshold/update',
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
        this.thresholdDelete = function () {
            var idArr = [];
            var callback = null;
            if (arguments.length > 0) {
                for (var i in arguments) {
                    var arg = arguments[i];
                    if (typeof arg == "function") {
                        callback = arg;
                        break;
                    }
                    else
                        idArr.push(arg);
                }
            }
            $http({
                method: 'GET',
                url: 'warning/threshold/delete',
                params: { id: _(idArr).join(",") }
            }).success(function (data, status, headers, config) {
                if (typeof callback === "function")
                    callback(data);
            }).error(function (data, status, headers, config) {
                if (typeof callback === "function")
                    callback({ success: false });
            });
        };
        //人行IP
        this.peoplebankList = function (params, callback) {
            $http({
                method: 'GET',
                url: 'setting/peoplebank/list',
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
        this.peoplebankSave = function (params, callback) {
            $http({
                method: 'GET',
                url: 'setting/peoplebank/add',
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
        this.peoplebankUpdate = function (params, callback) {
            $http({
                method: 'GET',
                url: 'setting/peoplebank/update',
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
        this.peoplebankDelete = function () {
            var idArr = [];
            var callback = null;
            if (arguments.length > 0) {
                for (var i in arguments) {
                    var arg = arguments[i];
                    if (typeof arg == "function") {
                        callback = arg;
                        break;
                    }
                    else
                        idArr.push(arg);
                }
            }
            $http({
                method: 'GET',
                url: 'setting/peoplebank/delete',
                params: { id: _(idArr).join(",") }
            }).success(function (data, status, headers, config) {
                if (typeof callback === "function")
                    callback(data);
            }).error(function (data, status, headers, config) {
                if (typeof callback === "function")
                    callback({ success: false });
            });
        };
        //银联IP
        this.unionpayList = function (params, callback) {
            $http({
                method: 'GET',
                url: 'setting/unionpay/list',
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
        this.unionpaySave = function (params, callback) {
            $http({
                method: 'GET',
                url: 'setting/unionpay/add',
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
        this.unionpayUpdate = function (params, callback) {
            $http({
                method: 'GET',
                url: 'setting/unionpay/update',
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
        this.unionpayDelete = function () {
            var idArr = [];
            var callback = null;
            if (arguments.length > 0) {
                for (var i in arguments) {
                    var arg = arguments[i];
                    if (typeof arg == "function") {
                        callback = arg;
                        break;
                    }
                    else
                        idArr.push(arg);
                }
            }
            $http({
                method: 'GET',
                url: 'setting/unionpay/delete',
                params: { id: _(idArr).join(",") }
            }).success(function (data, status, headers, config) {
                if (typeof callback === "function")
                    callback(data);
            }).error(function (data, status, headers, config) {
                if (typeof callback === "function")
                    callback({ success: false });
            });
        };
    });
});