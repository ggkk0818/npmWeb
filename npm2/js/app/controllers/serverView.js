define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/index.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('ServerViewCtrl', function ($rootScope, $scope, $route, $interval, $location, $timeout, $window, dateTimeService, networkOverviewService, networkPerspectiveService) {
        //初始化变量
        $scope.ipSegmentList = null;
        $scope.serviceList = null;
        $scope.pageNum = 1;
        $scope.pageTotal = 1;
        $scope.pageSize = 999;
        $scope.recordSize = 0;
        $scope.recordList = null;
        $scope.startDate = null;
        $scope.startTime = null;
        $scope.endTime = null;
        $scope.queryType = "group";
        $scope.queryService = null;
        //表单数据
        $scope.startDateInput = $scope.startDate = dateTimeService.serverTime.Format("yyyy-MM-dd");
        $scope.queryServiceInput = $scope.queryService = null;
        $scope.keywordInput = $scope.queryType;
        $scope.serviceInput = null;
        //初始化
        $scope.init = function () {
            $scope.setSearchParams();
            $scope.doQuery();
        };
        //获取查询参数
        $scope.getSearchParams = function () {
            var params = {};
            if ($scope.startDate)
                params.startDate = $scope.startDate;
            if (typeof $scope.queryType === "object")
                params.queryType = $scope.queryType.ipSegment;
            else if ($scope.queryType)
                params.queryType = $scope.queryType;
            if ($scope.queryService)
                params.queryService = $scope.queryService.protocol + $scope.queryService.port;
            return params;
        };
        //从url获取查询参数设置变量
        $scope.setSearchParams = function () {
            var params = $location.search();
            if (!params)
                return;
            if (params.startDate) {
                $scope.startDate = params.startDate;
                $scope.startDateInput = params.startDate;
            }
            if (params.startTime)
                $scope.startTime = params.startTime;
            if (params.endTime)
                $scope.endTime = params.endTime;
            if (params.queryType) {
                $scope.queryType = params.queryType;
            }
            if (params.queryService) {
                $scope.queryService = params.queryService;
            }
            if (!$scope.startTime || !$scope.endTime) {
                var today = new Date($scope.startDate.replace(/-/g, "/"));
                if (!$scope.endTime) {
                    if ($scope.startTime) {
                        var time = new Date($scope.startDate.replace(/-/g, "/") + " " + $scope.startTime);
                        time.setHours(time.getHours() + 1);
                        if (time.getDate() == today.getDate()) {
                            $scope.endTime = time.Format("hh:mm:ss");
                        }
                        else {
                            $scope.endTime = "23:59:59";
                        }
                    }
                    else{
                        $scope.endTime = dateTimeService.serverTime.Format("hh:mm:ss");
                    }
                }
                if (!$scope.startTime) {
                    var time = new Date($scope.startDate.replace(/-/g, "/") + " " + $scope.endTime);
                    time.setHours(time.getHours() - 1);
                    if (time.getDate() == today.getDate()) {
                        $scope.startTime = time.Format("hh:mm:ss");
                    }
                    else {
                        $scope.startTime = "00:00:00";
                    }
                }
            }
        };
        //显示信息
        $scope.show = function () {
            var params = $scope.getSearchParams();
            if (_.isEqual(params, $location.search()))
                params.refresh = true;
            $location.search(params);
        };
        //查询数据
        $scope.doQuery = function () {
            var params = {
                startTime: $scope.startDate + " " + $scope.startTime,
                endTime: $scope.startDate + " " + $scope.endTime
            };
            networkOverviewService.ipSegment(params, function (data) {
                if (data && data.data) {
                    $scope.ipSegmentList = data.data;
                    if ($scope.queryType != "group" && $scope.ipSegmentList.length) {
                        if (typeof $scope.queryType === "object")
                            $scope.queryType = $scope.queryType.ipSegment;
                        for (var i = 0; i < $scope.ipSegmentList.length; i++) {
                            var segment = $scope.ipSegmentList[i];
                            if ($scope.queryType == segment.ipSegment) {
                                $scope.queryType = segment;
                                $timeout(function () {
                                    $scope.keywordInput = segment.ipSegment;
                                });
                                break;
                            }
                        }
                    }
                    if (typeof $scope.queryType === "object" || $scope.queryType == "group") {
                        $scope.queryGroup();
                    }
                }
            });
            networkPerspectiveService.openService(params, function (data) {
                if (data && data.data) {
                    $scope.serviceList = data.data;
                    if ($scope.queryService != null && $scope.serviceList.length) {
                        for (var i = 0; i < $scope.serviceList.length; i++) {
                            var service = $scope.serviceList[i];
                            if ($scope.queryService == service.protocol + service.port) {
                                $scope.queryService = service;
                                $timeout(function () {
                                    $scope.serviceInput = service.protocol + service.port;
                                });
                                break;
                            }
                        }
                    }
                    else if ($scope.serviceList.length) {
                        $scope.queryService = $scope.serviceList[0];
                        $timeout(function () {
                            $scope.serviceInput = $scope.queryService.protocol + $scope.queryService.port;
                        });
                    }
                    if (typeof $scope.queryService === "object" && $scope.queryService != null) {
                        $scope.queryServiceInfo();
                    }
                }
            });
        };
        //查询ip或ip组列表
        $scope.queryGroup = function () {
            if ($scope.queryType == "group") {
                var params = {
                    startTime: $scope.startDate + " " + $scope.startTime,
                    endTime: $scope.startDate + " " + $scope.endTime,
                    start: 0,
                    limit: 999
                };
                networkOverviewService.groupList(params, function (data) {
                    if (data) {
                        $scope.ipRecordList = data.data ? data.data : [];
                        for (var i = 0; i < $scope.ipRecordList.length; i++) {
                            var record = $scope.ipRecordList[i];
                            $scope.queryGroupDetail(record);
                        }
                    }
                });
            }
            else if (typeof $scope.queryType === "object" && $scope.queryType != null) {
                $scope.ipRecordList = [];
                if ($scope.queryType.ips) {
                    for (var i = 0; i < $scope.queryType.ips.length; i++) {
                        var record = { ip: $scope.queryType.ips[i] };
                        $scope.ipRecordList.push(record);
                        $scope.queryGroupDetail(record);
                    }
                }
            }
        };
        //查询ip或ip组详情
        var progressBarClassArr = ["", "progress-bar-info", "progress-bar-success", "progress-bar-warning", "progress-bar-danger"];
        var serviceColorMap = {};
        $scope.queryGroupDetail = function (record) {
            if (!record)
                return;
            var params = {
                startTime: $scope.startDate + " " + $scope.startTime,
                endTime: $scope.startDate + " " + $scope.endTime
            };
            if (record.ips) {
                for (var i = 0; i < record.ips.length; i++) {
                    params["ips[" + i + "]"] = record.ips[i];
                }
            }
            else if (record.ip) {
                params.ip = record.ip;
            }
            networkOverviewService.groupMetric(params, function (data) {
                if (data && data.status == "200") {
                    $.extend(record, data);
                    var ratioTotal = 0;
                    for (var i = 0; i < record.protocolRatio.length; i++) {
                        var service = record.protocolRatio[i];
                        ratioTotal += service.flow || 0;
                        if (serviceColorMap[service.protocol + service.port] == undefined) {
                            serviceColorMap[service.protocol + service.port] = progressBarClassArr[Math.floor(Math.random() * 5)];
                        }
                        service.progressBarClass = serviceColorMap[service.protocol + service.port];
                    }
                    if (record.protocolRatio.length > 5) {
                        var otherFlow = 0;
                        for (var i = 4; i < record.protocolRatio.length; i++) {
                            var service = record.protocolRatio[i];
                            otherFlow += service.flow;
                        }
                        record.protocolRatio[4].name = "其他";
                        record.protocolRatio[4].flow = otherFlow;
                        record.protocolRatio.splice(5, record.protocolRatio.length - 5);
                    }
                    for (var i = 0; i < record.protocolRatio.length; i++) {
                        var service = record.protocolRatio[i];
                        service.percent = (service.flow || 0) / ratioTotal * 100;
                    }
                }
            });
        };
        //查询服务信息
        $scope.queryServiceInfo = function () {
            var params = {
                startTime: $scope.startDate + " " + $scope.startTime,
                endTime: $scope.startDate + " " + $scope.endTime,
                protocol: $scope.queryService.protocol,
                port: $scope.queryService.port,
                start: 0,
                limit: 999
            };
            networkOverviewService.ipList(params, function (data) {
                if (data && data.ip) {
                    $scope.serviceRecordList = data.ip;
                    for (var i = 0; i < $scope.serviceRecordList.length; i++) {
                        var record = { ip: $scope.serviceRecordList[i] };
                        $scope.serviceRecordList[i] = record;
                        $scope.queryServiceDetail(record);
                    }
                }
            });
        };
        $scope.queryServiceDetail = function (record) {
            if (!record)
                return;
            var params = {
                startTime: $scope.startDate + " " + $scope.startTime,
                endTime: $scope.startDate + " " + $scope.endTime,
                ip: record.ip
            };
            record.loading = true;
            networkOverviewService.systemInfOs(params, function (data) {
                if (data && data.status == "200") {
                    record.systemInfo = data.system && data.system.length ? data.system[0] : null;
                    record.ratioList = data.ratio ? data.ratio : [];
                    if (record.systemInfo && record.systemInfo.uptimeMins) {
                        record.systemInfo.hasUpTimes = true;
                        if (record.systemInfo.uptimeMins >= 60) {
                            record.systemInfo.uptimeHours = Math.floor(record.systemInfo.uptimeMins / 60);
                            record.systemInfo.uptimeMins = record.systemInfo.uptimeMins % 60;
                        }
                        if (record.systemInfo.uptimeHours >= 24) {
                            record.systemInfo.uptimeDays = Math.floor(record.systemInfo.uptimeHours / 24);
                            record.systemInfo.uptimeHours = record.systemInfo.uptimeMins % 24;
                        }
                    }
                }
                record.loading = false;
            });
        };
        //搜索
        $scope.search = function () {
            if (typeof $scope.startDateInput == "undefined" || $scope.startDateInput == null || $scope.startDateInput.length == 0)
                $scope.startDate = null;
            else
                $scope.startDate = $scope.startDateInput;
            if ($scope.keywordInput != "group") {
                for (var i = 0; i < $scope.ipSegmentList.length; i++) {
                    var segment = $scope.ipSegmentList[i];
                    if ($scope.keywordInput == segment.ipSegment) {
                        $scope.queryType = segment;
                        break;
                    }
                }
            }
            else {
                $scope.keywordInput = $scope.queryType = "group";
            }
            if ($scope.serviceInput) {
                for (var i = 0; i < $scope.serviceList.length; i++) {
                    var service = $scope.serviceList[i];
                    if ($scope.serviceInput == service.protocol + service.port) {
                        $scope.queryService = service;
                        break;
                    }
                }
            }
            $scope.show();
        };
        //表单输入框按键事件
        $scope.formKeypressHandler = function (e) {
            if (e.keyCode == 13) {
                $scope.search();
            }
        };
        //前一天
        $scope.addDay = function (num) {
            if (typeof num === "number") {
                var date = new Date($scope.startDate.replace(/-/g, "/"));
                date.setDate(date.getDate() + num);
                $scope.startDateInput = $scope.startDate = date.Format("yyyy-MM-dd");
            }
            else {
                $scope.startDateInput = $scope.startDate = dateTimeService.serverTime.Format("yyyy-MM-dd");
            }
            $scope.show();
        };

        $scope.$on("rangeSlideValuesChanged", function (e, $context, elem, event, data) {
            if (data.values.min instanceof Date)
                $scope.startTime = data.values.min.Format("hh:mm:ss");
            if (data.values.max instanceof Date)
                $scope.endTime = data.values.max.Format("hh:mm:ss");
            $scope.recordList = null;
            $scope.doQuery();
        });

        //窗口调整时更新图表大小
        var windowResize = function () {
            
        };
        $($window).off("resize.index").on("resize.index", windowResize).trigger("resize.index");
        //离开该页事件
        $scope.$on("$routeChangeStart", function () {
            $($window).off("resize.index");
        });
        //执行初始化
        $scope.init();
    });
});