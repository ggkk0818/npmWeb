define([
  'angular',
  'jquery',
  'lodash',
  'config'
],
function (angular, $, _, config) {
    'use strict';
    var module = angular.module('app.services');
    module.service('flowService', function ($routeParams, $http, $rootScope) {
        this.ip = function (params, callback) {
            $http({
                method: 'GET',
                url: 'statistics/ip/detail',
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
        this.ipIntranet = function (params, callback) {
            $http({
                method: 'GET',
                url: 'statistics/ip/intranet/detail',
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
        this.mac = function (params, callback) {
            $http({
                method: 'GET',
                url: 'statistics/mac/detail',
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
        this.port = function (params, callback) {
            $http({
                method: 'GET',
                url: 'statistics/port/detail',
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
        this.protocol = function (params, callback) {
            $http({
                method: 'GET',
                url: 'statistics/protocol/detail',
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
        this.ipFlowChart = function (params, callback) {
            $http({
                method: 'GET',
                url: 'statistics/ip/flow',
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
        this.ipIntranetFlowChart = function (params, callback) {
            $http({
                method: 'GET',
                url: 'statistics/ip/intranet/flow',
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
        this.macFlowChart = function (params, callback) {
            $http({
                method: 'GET',
                url: 'statistics/mac/flow',
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
        this.protocolFlowChart = function (params, callback) {
            $http({
                method: 'GET',
                url: 'statistics/protocol/flow',
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
        this.portFlowChart = function (params, callback) {
            $http({
                method: 'GET',
                url: 'statistics/port/flow',
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
        this.ipChart = function (params, callback) {
            $http({
                method: 'GET',
                url: 'statistics/ip',
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
        this.ipIntranetChart = function (params, callback) {
            $http({
                method: 'GET',
                url: 'statistics/ip/intranet',
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
        this.protocolChart = function (params, callback) {
            $http({
                method: 'GET',
                url: 'statistics/protocol',
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
        this.portChart = function (params, callback) {
            $http({
                method: 'GET',
                url: 'statistics/port',
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
        this.macChart = function (params, callback) {
            $http({
                method: 'GET',
                url: 'statistics/mac',
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
        this.timeFlow = function (params, callback) {
            $http({
                method: 'GET',
                url: 'statistics/time/flow',
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

        this.settings = function (params, callback) {
            $http({
                method: 'GET',
                url: 'ip/config',
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
        this.settingsSave = function (params, callback) {
            $http({
                method: 'POST',
                url: 'ip/config',
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
        this.settingsUpdate = function (params, callback) {
            $http({
                method: 'PUT',
                url: 'ip/config',
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
        this.settingsDelete = function (params, callback) {
            $http({
                method: 'DELETE',
                url: 'ip/config',
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

        this.settingsDetailSave = function (params, callback) {
            $http({
                method: 'POST',
                url: 'ip/detail',
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
        this.settingsDetailUpdate = function (params, callback) {
            $http({
                method: 'PUT',
                url: 'ip/detail',
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
        this.settingsDetailDelete = function (params, callback) {
            $http({
                method: 'DELETE',
                url: 'ip/detail',
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

        this.follow = function (params, callback) {
            $http({
                method: 'GET',
                url: 'ip/follow',
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
        this.followIntranet = function (params, callback) {
            $http({
                method: 'GET',
                url: 'ip/intranet/follow',
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
        this.followDetail = function (params, callback) {
            $http({
                method: 'GET',
                url: 'ip/follow/detail',
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
        this.unfollow = function (params, callback) {
            $http({
                method: 'GET',
                url: 'ip/unfollow',
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
        this.unfollowIntranet = function (params, callback) {
            $http({
                method: 'GET',
                url: 'ip/intranet/unfollow',
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
        this.unfollowDetail = function (params, callback) {
            $http({
                method: 'GET',
                url: 'ip/unfollow/detail',
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
        this.other = function (params, callback) {
            $http({
                method: 'GET',
                url: 'ip/other',
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

        this.systemDetail = function (params, callback) {
            $http({
                method: 'GET',
                url: 'ip/system',
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