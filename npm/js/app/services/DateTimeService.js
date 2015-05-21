define([
  'angular',
  'jquery',
  'lodash',
  'config'
],
function (angular, $, _, config) {
    'use strict';
    var module = angular.module('app.services');
    module.service('dateTimeService', function ($http, $rootScope, $interval) {
        var thiz = this;
        this.serverTime = new Date();
        //查询服务器时间
        this.queryServerTime = function () {
            var startTime = new Date();
            $http({
                method: 'GET',
                url: 'time',
                cache: false
            }).success(function (data, status, headers, config) {
                if (data && data.curTime) {
                    var recvTime = new Date(),
                        serverTime = new Date(data.curTime.replace(/-/g, "/"));
                    thiz.serverTime = new Date((serverTime.getTime() * 2 - startTime.getTime() - recvTime.getTime()) / 2 + recvTime.getTime());
                }
            }).error(function (data, status, headers, config) {
                console.warn("获取服务器时间失败。" + status);
            });
        };
        //每60秒同步时间
        $interval(function () {
            thiz.queryServerTime();
        }, 60000);
        //服务器时间时钟
        $interval(function () {
            if (thiz.serverTime) {
                thiz.serverTime = new Date(thiz.serverTime.getTime() + 1000);
            }
        }, 1000);
        //执行同步
        this.queryServerTime();
    });
});