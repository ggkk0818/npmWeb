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
        this.show = function (params, callback) {
            $http({
                method: 'GET',
                url: 'statistics/show',
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