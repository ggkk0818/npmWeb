define([
  'angular',
  'jquery',
  'lodash',
  'config'
],
function (angular, $, _, config) {
    'use strict';
    var module = angular.module('app.services');
    module.service('pcapService', function ($http, $rootScope, $interval) {
        //下载pcap
        this.pcapSearch = function (params, callback) {
            $http({
                method: 'GET',
                url: 'overview/group/list',
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