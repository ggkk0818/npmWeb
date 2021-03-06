﻿define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/deviceStatistic.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('DeviceStatisticCtrl', function ($rootScope, $scope, $route, $timeout, $location, statisticService, warningService) {
        //初始化变量
        $scope.LOG_TYPE = [
            { id: "8583", name: "8583", warnId: "iso8583" },
            { id: "20022", name: "20022", warnId: "iso20022" },
            { id: "http", name: "http", warnId: "http" },
            { id: "mysql", name: "mysql", warnId: "mysql" }
        ];
        $scope.DURATION_TYPE = [
            { id: "minute", name: "1分钟" },
            { id: "hour", name: "1小时" },
            { id: "day", name: "1天" }
        ];
        $scope.pageNum = 1;
        $scope.pageTotal = 1;
        $scope.pageSize = 10;
        $scope.recordSize = 0;
        $scope.startTime = null;
        $scope.logType = $scope.LOG_TYPE[0];
        $scope.durationType = $scope.DURATION_TYPE[0];
        //当前搜索参数
        $scope.queryStartTime = null;
        $scope.queryLogType = null;
        $scope.queryDurationType = null;
        //表单数据
        $scope.startTimeInput = $scope.startTime = new Date().Format("yyyy-MM-dd hh:mm:00");
        //获取查询参数
        $scope.getSearchParams = function () {
            var params = { pageNum: $scope.pageNum };
            if ($scope.startTime)
                params.startTime = $scope.startTime;
            if ($scope.logType)
                params.logType = $scope.logType.id;
            if ($scope.durationType)
                params.durationType = $scope.durationType.id;
            return params;
        };
        //从url获取查询参数设置变量
        $scope.setSearchParams = function () {
            var params = $location.search();
            if (!params)
                return;
            if (params.pageNum)
                $scope.pageNum = parseInt(params.pageNum);
            if (params.startTime) {
                $scope.startTime = params.startTime;
                $scope.startTimeInput = params.startTime;
            }
            if (params.logType) {
                for (var i = 0; i < $scope.LOG_TYPE.length; i++) {
                    if (params.logType == $scope.LOG_TYPE[i].id)
                        $scope.logType = $scope.LOG_TYPE[i];
                }
            }
            if (params.durationType) {
                for (var i = 0; i < $scope.DURATION_TYPE.length; i++) {
                    if (params.durationType == $scope.DURATION_TYPE[i].id)
                        $scope.durationType = $scope.DURATION_TYPE[i];
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
            $scope.queryStartTime = $scope.startTime;
            $scope.queryLogType = $scope.logType;
            $scope.queryDurationType = $scope.durationType;
            var params = {
                type: $scope.logType.id,
                start: ($scope.pageNum - 1) * $scope.pageSize,
                limit: $scope.pageSize
            };
            if ($scope.startTime) {
                params.starttime = $scope.startTime;
            }
            if ($scope.startTime && $scope.durationType) {
                var endTime = new Date($scope.startTime.replace(/-/g, "/")),
                    durationId = $scope.durationType.id;
                if (durationId == "minute") {
                    endTime.setMinutes(endTime.getMinutes() + 1);
                }
                else if (durationId == "hour") {
                    endTime.setHours(endTime.getHours() + 1);
                }
                else if (durationId == "day") {
                    endTime.setDate(endTime.getDate() + 1);
                }
                params.endtime = endTime.Format("yyyy-MM-dd hh:mm:ss");
            }
            statisticService.showDevice(params, function (data) {
                $scope.success = data && data.state == 200 ? true : false;
                $scope.recordList = data && data.data ? data.data : [];
                if ($scope.recordList && $scope.recordList.length) {
                    for (var i = 0; i < $scope.recordList.length; i++) {
                        var record = $scope.recordList[i];
                        if (typeof record.count === "number" && typeof record.scount === "number")
                            record.scount = Math.round(record.scount * 10000 / record.count) / 100;
                        if (typeof record.count === "number" && typeof record.rcount === "number")
                            record.rcount = Math.round(record.rcount * 10000 / record.count) / 100;
                        if (typeof record.allflow === "number")
                            record.allflow = numeral(record.allflow).format("0.00b");
                    }
                    if ($scope.queryLogType && $scope.queryLogType.warnId) {
                        //查询告警信息
                        warningService.showDevice({ type: $scope.queryLogType.warnId, startWarnTime: params.starttime, endWarnTime: params.endtime, start: params.start, limit: params.limit }, function (data2) {
                            if (data2 &&  data2.data) {
                                for (var i = 0; i < data2.data.length; i++) {
                                    var warnRecord = data2.data[i];
                                    for (var j = 0; j < $scope.recordList.length; j++) {
                                        var record = $scope.recordList[j];
                                        if (warnRecord.srcip == record.srcip && warnRecord.dstip == record.dstip) {
                                            record.warnCount = warnRecord.count;
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
                $scope.isLoading = false;
            });
        };
        //表格行点击
        $scope.directToStatisticSearch = function (record) {
            var params = {};
            if ($scope.queryLogType)
                params.logType = $scope.queryLogType.id;
            if ($scope.queryStartTime) {
                params.startTime = $scope.queryStartTime;
            }
            if ($scope.queryStartTime && $scope.queryDurationType) {
                var endTime = new Date($scope.queryStartTime.replace(/-/g, "/")),
                    durationId = $scope.queryDurationType.id;
                if (durationId == "minute") {
                    endTime.setMinutes(endTime.getMinutes() + 1);
                }
                else if (durationId == "hour") {
                    endTime.setHours(endTime.getHours() + 1);
                }
                else if (durationId == "day") {
                    endTime.setDate(endTime.getDate() + 1);
                }
                params.endtime = endTime.Format("yyyy-MM-dd hh:mm:ss");
            }
            if (record.srcip) {
                params.srcIp = record.srcip;
            }
            if (record.dstip) {
                params.dstIp = record.dstip;
            }
            $location.path("/trace/statistic").search(params);
        };
        //搜索统计信息
        $scope.search = function () {
            if (typeof $scope.startTimeInput == "undefined" || $scope.startTimeInput == null || $scope.startTimeInput.length == 0)
                $scope.startTime = null;
            else
                $scope.startTime = $scope.startTimeInput;
            $scope.show(1);
        };
        //表单输入框按键事件
        $scope.formKeypressHandler = function (e) {
            if (e.keyCode == 13) {
                $scope.search();
            }
        };
        //canvas
        $scope.draw = function (list) {
            var sys = arbor.ParticleSystem(1000, 600, 0.5) // create the system with sensible repulsion/stiffness/friction
            sys.parameters({ gravity: true }) // use center-gravity to make the graph settle nicely (ymmv)
            sys.renderer = arborService.getRender()("#deviceStatistic_topology") // our newly created renderer will have its .init() method called shortly by sys...

            if (list && list.length) {
                var nodes = {}, edges = {};
                for (var i = 0; i < list.length; i++) {
                    var record = list[i];
                    if (!nodes[record.srcip]) {
                        nodes[record.srcip] = { borders: Math.round(Math.random() * 10), length: record.allflow, label: record.srcip };
                        edges[record.srcip] = { };
                    }
                    else {
                        nodes[record.srcip].length += record.allflow;
                    }
                    edges[record.srcip][record.dstip] = { border: record.allflow };
                    //sys.addEdge(record.srcip, record.dstip);
                }
                sys.merge({ nodes: nodes, edges: edges });
            }
        };
        //获取url查询参数
        $scope.setSearchParams();
        $scope.doQuery();
    });
});