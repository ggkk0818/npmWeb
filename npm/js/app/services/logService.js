﻿define([
  'angular',
  'jquery',
  'lodash',
  'config'
],
function (angular, $, _, config) {
    'use strict';
    var module = angular.module('app.services');
    module.service('logService', function ($routeParams, $http, $rootScope) {
        //es原始日志查询
        this.list = function (params, callback) {
            $http({
                method: 'GET',
                url: 'log/show',
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