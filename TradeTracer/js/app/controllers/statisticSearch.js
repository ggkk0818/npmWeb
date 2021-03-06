﻿define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/statisticSearch.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('StatisticSearchCtrl', function ($rootScope, $scope, $route, $timeout, $location, statisticService, logService) {
        //初始化变量
        $scope.LOG_TYPE = [
            { id: "8583", name: "8583" },
            { id: "20022", name: "20022" },
            { id: "http", name: "http" },
            { id: "mysql", name: "mysql" }
        ];
        $scope.pageNum = 1;
        $scope.pageTotal = 1;
        $scope.pageSize = 10;
        $scope.recordSize = 0;
        $scope.keyword = null;
        $scope.srcIp = null;
        $scope.dstIp = null;
        $scope.duration = null;
        $scope.startTime = null;
        $scope.endTime = null;
        $scope.logType = $scope.LOG_TYPE[0];
        $scope.searchType = $scope.logType;
        //表单数据
        $scope.keywordInput = null;
        $scope.srcIpInput = null;
        $scope.dstIpInput = null;
        $scope.durationInput = null;
        //获取查询参数
        $scope.getSearchParams = function () {
            var params = { pageNum: $scope.pageNum };
            if ($scope.keyword)
                params.keyword = $scope.keyword;
            if ($scope.srcIp)
                params.srcIp = $scope.srcIp;
            if ($scope.dstIp)
                params.dstIp = $scope.dstIp;
            if ($scope.duration)
                params.duration = $scope.duration;
            if ($scope.startTime)
                params.startTime = $scope.startTime;
            if ($scope.endTime)
                params.endTime = $scope.endTime;
            if ($scope.logType)
                params.logType = $scope.logType.id;
            return params;
        };
        //从url获取查询参数设置变量
        $scope.setSearchParams = function () {
            var params = $location.search();
            if (!params)
                return;
            if (params.pageNum)
                $scope.pageNum = parseInt(params.pageNum);
            if (params.keyword) {
                $scope.keyword = params.keyword;
                $scope.keywordInput = params.keyword;
            }
            if (params.srcIp) {
                $scope.srcIp = params.srcIp;
                $scope.srcIpInput = params.srcIp;
            }
            if (params.dstIp) {
                $scope.dstIp = params.dstIp;
                $scope.dstIpInput = params.dstIp;
            }
            if (params.duration) {
                $scope.duration = params.duration;
                $scope.durationInput = params.duration;
            }
            if (params.startTime) {
                $scope.startTime = params.startTime;
                $scope.startTimeInput = params.startTime;
            }
            if (params.endTime) {
                $scope.endTime = params.endTime;
                $scope.endTimeInput = params.endTime;
            }
            if (params.logType) {
                for (var i = 0; i < $scope.LOG_TYPE.length; i++) {
                    if (params.logType == $scope.LOG_TYPE[i].id)
                        $scope.logType = $scope.LOG_TYPE[i];
                }
            }
        };
        //显示统计信息
        $scope.show = function (pageNum) {
            $scope.isLoading = true;
            if (pageNum)
                $scope.pageNum = pageNum;
            var params = $scope.getSearchParams();
            if (_.isEqual(params, $location.search()))
                params.refresh = true;
            $location.search(params);
        };

        $scope.doQuery = function () {
            $scope.searchType = $scope.logType;
            var params = {
                type: $scope.logType.id,
                start: ($scope.pageNum - 1) * $scope.pageSize,
                limit: $scope.pageSize
            };
            if ($scope.keyword) {
                params.aggregateKey = $scope.keyword;
            }
            if ($scope.srcIp) {
                params.srcip = $scope.srcIp;
            }
            if ($scope.dstIp) {
                params.destip = $scope.dstIp;
            }
            if ($scope.duration) {
                if ($scope.duration.indexOf("-") > -1) {
                    var arr = $scope.duration.split("-");
                    if (arr && arr.length && arr[0].length) {
                        params.startRespMills = arr[0];
                    }
                    if (arr && arr.length > 1 && arr[1].length) {
                        params.endRespMills = arr[1];
                    }
                }
                else {
                    params.startRespMills = params.endRespMills = $scope.duration;
                }
            }
            if ($scope.startTime) {
                params.starttime = $scope.startTime;
            }
            if ($scope.endTime) {
                params.endtime = $scope.endTime;
            }
            statisticService.list(params, function (data) {
                $scope.success = data && data.state == 200 ? true : false;
                $scope.recordList = data && data.data ? data.data : [];
                $scope.recordSize = data && data.count ? data.count : 0;
                $scope.pageTotal = Math.floor($scope.recordSize / $scope.pageSize) + ($scope.recordSize % $scope.pageSize > 0 ? 1 : 0);
                if ($scope.recordList && $scope.recordList.length) {
                    var uidList = [];
                    for (var i = 0; i < $scope.recordList.length; i++) {
                        var record = $scope.recordList[i];
                        if (typeof record.time1 === "number")
                            record.time1 = new Date(record.time1).Format("yyyy-MM-dd hh:mm:ss");
                        if (typeof record.time2 === "number")
                            record.time2 = new Date(record.time2).Format("yyyy-MM-dd hh:mm:ss");
                        if (typeof record.time3 === "number")
                            record.time3 = new Date(record.time3).Format("yyyy-MM-dd hh:mm:ss");
                        if (typeof record.starttime === "number")
                            record.starttime = new Date(record.starttime).Format("yyyy-MM-dd hh:mm:ss");
                        if (typeof record.endtime === "number")
                            record.endtime = new Date(record.endtime).Format("yyyy-MM-dd hh:mm:ss");
                        if (typeof record.flow === "number")
                            record.flow = numeral(record.flow).format("0.00b");
                        if (typeof record.status === "number") {
                            record.status = [
                                (record.status & 4) == 0,
                                (record.status & 2) == 0,
                                (record.status & 1) == 0
                            ];
                        }
                        if (typeof record.source_device === "string" && record.source_device.indexOf('_') > -1)
                            record.source_device = record.source_device.substring(0, record.source_device.indexOf('_'));
                        if (typeof record.dest_device === "string" && record.dest_device.indexOf('_') > -1)
                            record.dest_device = record.dest_device.substring(0, record.dest_device.indexOf('_'));
                        uidList.push(record.aggregate_key);
                    }
                    //查询ES信息
                    if ($scope.searchType.id == "8583" || $scope.searchType.id == "20022") {
                        logService.list({
                            logType: $scope.logType.id,
                            aggregateKey: uidList.join(","),
                            from: 0,
                            size: $scope.pageSize
                        }, function (data2) {
                            if (data2 && data2.data) {
                                for (var i = 0; i < data2.data.length; i++) {
                                    var record = data2.data[i];
                                    for (var j = 0; j < $scope.recordList.length; j++) {
                                        if (record.aggregate_key === $scope.recordList[j].uid)
                                            _.assign($scope.recordList[j], record);
                                    }
                                }
                            }
                        });
                    }
                }
                $scope.isLoading = false;
            });
        };
        //搜索统计信息
        $scope.search = function () {
            if (typeof $scope.durationInput == "undefined" || $scope.durationInput == null || $scope.durationInput.length == 0)
                $scope.duration = null;
            else
                $scope.duration = $scope.durationInput;
            if (typeof $scope.keywordInput == "undefined" || $scope.keywordInput == null || $scope.keywordInput.length == 0)
                $scope.keyword = null;
            else
                $scope.keyword = $scope.keywordInput;
            if (typeof $scope.srcIpInput == "undefined" || $scope.srcIpInput == null || $scope.srcIpInput.length == 0)
                $scope.srcIp = null;
            else
                $scope.srcIp = $scope.srcIpInput;
            if (typeof $scope.dstIpInput == "undefined" || $scope.dstIpInput == null || $scope.dstIpInput.length == 0)
                $scope.dstIp = null;
            else
                $scope.dstIp = $scope.dstIpInput;
            if (typeof $scope.startTimeInput == "undefined" || $scope.startTimeInput == null || $scope.startTimeInput.length == 0)
                $scope.startTime = null;
            else
                $scope.startTime = $scope.startTimeInput;
            if (typeof $scope.endTimeInput == "undefined" || $scope.endTimeInput == null || $scope.endTimeInput.length == 0)
                $scope.endTime = null;
            else
                $scope.endTime = $scope.endTimeInput;
            $scope.show(1);
        };
        //表单输入框按键事件
        $scope.formKeypressHandler = function (e) {
            if (e.keyCode == 13) {
                $scope.search();
            }
        };
        //获取url查询参数
        $scope.setSearchParams();
        $scope.doQuery();
    });
});