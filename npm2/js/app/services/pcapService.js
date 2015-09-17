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
        //查询Pcap
        this.pcapSearch = function (params, callback) {
            $http({
                method: 'GET',
                url: 'pcap/search',
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
        // 下载Pcap
        this.download = function (params, callback) {
            $http({
                method: 'GET',
                url: 'pcap/download',
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