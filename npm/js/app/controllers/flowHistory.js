define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/flowHistory.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('FlowHistoryCtrl', function ($rootScope, $scope, $route, $timeout, $interval, $location, dateTimeService, flowService) {
        //初始化变量
        $scope.QUERY_TYPE = [
            { name: "followIntranet", displayName: "关注（内网）", detailFuncName: "followDetail", queryDoneFuncName: "doQueryDone" },
            { name: "follow", displayName: "关注（外网）", detailFuncName: "followDetail", queryDoneFuncName: "doQueryDoneInternet" },
            { name: "other", displayName: "其他", detailFuncName: "unfollowDetail", queryDoneFuncName: "doQueryDone" }
        ];
        $scope.queryType = $scope.QUERY_TYPE[0];
        $scope.pageNum = 1;
        $scope.pageTotal = 1;
        $scope.pageSize = 5;
        $scope.recordSize = 0;
        $scope.recordList = null;
        $scope.startDate = null;
        $scope.startTime = null;
        $scope.keyword = null;
        $scope.duration = null;
        $scope.currentRecord = null;
        $scope.currentSessionRecord = null;
        //表单数据
        $scope.startDateInput = $scope.startDate = new Date(dateTimeService.serverTime.getTime() - 300000).Format("yyyy-MM-dd");
        $scope.startTimeInput = $scope.startTime = new Date(dateTimeService.serverTime.getTime() - 300000).Format("hh:mm:ss");
        $scope.keywordInput = null;
        $scope.durationInput = $scope.duration = 300;
        $scope.durationInputHasError = false;
        //获取查询参数
        $scope.getSearchParams = function () {
            var params = { pageNum: $scope.pageNum };
            if ($scope.startTime)
                params.startTime = $scope.startDate + " " + $scope.startTime;
            if ($scope.keyword)
                params.keyword = $scope.keyword;
            if ($scope.duration)
                params.duration = $scope.duration;
            if ($scope.queryType)
                params.queryType = $scope.queryType.name;
            return params;
        };
        //从url获取查询参数设置变量
        $scope.setSearchParams = function () {
            var params = $location.search();
            if (!params)
                return;
            if (params.startTime) {
                var arr = params.startTime.split(" ");
                $scope.startDate = arr[0];
                $scope.startDateInput = arr[0];
                $scope.startTime = arr[1];
                $scope.startTimeInput = arr[1];
            }
            if (params.pageNum)
                $scope.pageNum = parseInt(params.pageNum);
            if (params.keyword) {
                $scope.keyword = params.keyword;
                $scope.keywordInput = params.keyword;
            }
            if (params.duration) {
                $scope.duration = params.duration;
                $scope.durationInput = params.duration;
            }
            if (params.queryType) {
                for (var i = 0; i < $scope.QUERY_TYPE.length; i++) {
                    if (params.queryType == $scope.QUERY_TYPE[i].name)
                        $scope.queryType = $scope.QUERY_TYPE[i];
                }
            }
        };
        //显示信息
        $scope.show = function (pageNum) {
            if (isNaN(parseInt($scope.durationInput, 10)) || parseInt($scope.durationInput, 10) > 900) {
                $scope.durationInputHasError = true;
                return;
            }
            if (pageNum)
                $scope.pageNum = pageNum;
            var params = $scope.getSearchParams();
            if (_.isEqual(params, $location.search()))
                params.refresh = true;
            $location.search(params);
        };

        $scope.doQuery = function () {
            if ($scope.queryType.name == "other" && !$scope.keyword)
                return;
            var params = {
                start: ($scope.pageNum - 1) * $scope.pageSize,
                limit: $scope.pageSize
            };
            if ($scope.startDate && $scope.startTime) {
                params.startTime = $scope.startDate + " " + $scope.startTime;
            }
            if (params.startTime && $scope.durationInput) {
                try {
                    var duration = parseInt($scope.duration, 10),
                        startTime = new Date(params.startTime.replace(/-/g, "/"));
                    if (!isNaN(duration)) {
                        startTime.setSeconds(startTime.getSeconds() + duration);
                        params.endTime = startTime.Format("yyyy-MM-dd hh:mm:ss");
                    }
                }
                catch (e) { }
            }
            if ($scope.keyword) {
                params.ip = $scope.keyword;
            }
            flowService[$scope.queryType.name].call(this, params, $scope[$scope.queryType.queryDoneFuncName]);
        };
        $scope.doQueryDone = function (data) {
            $scope.success = data && data.status == 200 ? true : false;
            $scope.recordList = data && data.data ? data.data : [];
            $scope.recordSize = data && data.count ? data.count : 0;
            $scope.pageTotal = Math.floor($scope.recordSize / $scope.pageSize) + ($scope.recordSize % $scope.pageSize > 0 ? 1 : 0);
            if ($scope.recordList) {
                var recordList = [];
                for (var ip in $scope.recordList) {
                    var record = { ip: ip, ipStatisticses: $scope.recordList[ip] };
                    if (record.ipStatisticses && record.ipStatisticses.length)
                        record.alias = record.ipStatisticses[0].alias;
                    recordList.push(record);
                }
                $scope.recordList = recordList;
                $scope.doDetailQuery();
                $scope.doSystemQuery();
            }
        };
        $scope.doQueryDoneInternet = function (data) {
            $scope.success = data && data.status == 200 ? true : false;
            $scope.recordList = data && data.data ? data.data : [];
            $scope.recordSize = data && data.count ? data.count : 0;
            $scope.pageTotal = Math.floor($scope.recordSize / $scope.pageSize) + ($scope.recordSize % $scope.pageSize > 0 ? 1 : 0);
            if ($scope.recordList) {
                var recordList = [];
                for (var ip in $scope.recordList) {
                    var record = $scope.recordList[ip];
                    record.ip = ip;
                    if (record.ipStatisticses && record.ipStatisticses.length) {
                        record.alias = record.ipStatisticses[0].alias;
                    }
                    recordList.push(record);
                }
                $scope.recordList = recordList;
                $scope.doDetailQuery();
                $scope.doSystemQuery();
            }
        };
        //查询详情
        $scope.doDetailQuery = function () {
            var params = {};
            if ($scope.recordList && $scope.recordList.length) {
                for (var i = 0; i < $scope.recordList.length; i++) {
                    params["ips[" + i + "]"] = $scope.recordList[i].ip;
                }
            }
            else {
                return;
            }
            if ($scope.startDate && $scope.startTime) {
                params.startTime = $scope.startDate + " " + $scope.startTime;
            }
            if (params.startTime && $scope.durationInput) {
                try {
                    var duration = parseInt($scope.duration, 10),
                        startTime = new Date(params.startTime.replace(/-/g, "/"));
                    if (!isNaN(duration)) {
                        startTime.setSeconds(startTime.getSeconds() + duration);
                        params.endTime = startTime.Format("yyyy-MM-dd hh:mm:ss");
                    }
                }
                catch (e) { }
            }
            flowService[$scope.queryType.detailFuncName].call(this, params, $scope.doDetailQueryDone);
        };
        $scope.doDetailQueryDone = function (data) {
            if ($scope.recordList && $scope.recordList.length) {
                for (var i = 0; i < $scope.recordList.length; i++) {
                    $scope.recordList[i].detailList = [];
                }
                if (data && data.status == 200 && data.data) {
                    for (var i = 0; i < data.data.length; i++) {
                        var detail = data.data[i];
                        for (var j = 0; j < $scope.recordList.length; j++) {
                            var record = $scope.recordList[j];
                            if (detail.ip === record.ip) {
                                record.detailList.push(detail);
                                break;
                            }
                        }
                    }
                }
            }
        };
        //查询操作系统信息
        $scope.doSystemQuery = function () {
            var params = {};
            if ($scope.recordList && $scope.recordList.length) {
                for (var i = 0; i < $scope.recordList.length; i++) {
                    params["ips[" + i + "]"] = $scope.recordList[i].ip;
                }
            }
            else {
                return;
            }
            if ($scope.startDate && $scope.startTime) {
                params.startTime = $scope.startDate + " " + $scope.startTime;
            }
            if (params.startTime && $scope.durationInput) {
                try {
                    var duration = parseInt($scope.duration, 10),
                        startTime = new Date(params.startTime.replace(/-/g, "/"));
                    if (!isNaN(duration)) {
                        startTime.setSeconds(startTime.getSeconds() + duration);
                        params.endTime = startTime.Format("yyyy-MM-dd hh:mm:ss");
                    }
                }
                catch (e) { }
            }
            flowService.systemDetail(params, function (data) {
                if ($scope.recordList && $scope.recordList.length) {
                    if (data && data.status == 200 && data.data) {
                        for (var i = 0; i < data.data.length; i++) {
                            var detail = data.data[i];
                            for (var j = 0; j < $scope.recordList.length; j++) {
                                var record = $scope.recordList[j];
                                if (detail.ip === record.ip) {
                                    record.os = detail.os;
                                    record.osVersion = detail.osVersion;
                                    if (detail.uptimeMins) {
                                        record.hasUpTimes = true;
                                        record.uptimeMins = detail.uptimeMins;
                                        if (record.uptimeMins >= 60) {
                                            record.uptimeHours = Math.floor(record.uptimeMins / 60);
                                            record.uptimeMins = record.uptimeMins % 60;
                                        }
                                        if (record.uptimeHours >= 24) {
                                            record.uptimeDays = Math.floor(record.uptimeHours / 24);
                                            record.uptimeHours = record.uptimeMins % 24;
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
            });
        };
        //ip精确查询
        $scope.searchQuery = function () {
            $scope.recordList = null;
            var params = {
                ip: $scope.keyword
            };
            if ($scope.startDate && $scope.startTime) {
                params.startTime = $scope.startDate + " " + $scope.startTime;
            }
            if (params.startTime && $scope.durationInput) {
                try {
                    var duration = parseInt($scope.duration, 10),
                        startTime = new Date(params.startTime.replace(/-/g, "/"));
                    if (!isNaN(duration)) {
                        startTime.setSeconds(startTime.getSeconds() + duration);
                        params.endTime = startTime.Format("yyyy-MM-dd hh:mm:ss");
                    }
                }
                catch (e) { }
            }
            flowService.other(params, function (data) {
                //内网
                $scope.QUERY_TYPE[0].recordList = data && data["f-intra"] ? data["f-intra"] : [];
                if ($scope.QUERY_TYPE[0].recordList) {
                    var recordList = [];
                    for (var ip in $scope.QUERY_TYPE[0].recordList) {
                        var record = { ip: ip, ipStatisticses: $scope.QUERY_TYPE[0].recordList[ip] };
                        if (record.ipStatisticses && record.ipStatisticses.length)
                            record.alias = record.ipStatisticses[0].alias;
                        recordList.push(record);
                    }
                    $scope.QUERY_TYPE[0].recordList = recordList;
                }
                $scope.QUERY_TYPE[0].recordSize = $scope.QUERY_TYPE[0].recordList ? $scope.QUERY_TYPE[0].recordList.length : 0;
                $scope.QUERY_TYPE[0].pageTotal = Math.floor($scope.QUERY_TYPE[0].recordSize / $scope.QUERY_TYPE[0].pageSize) + ($scope.QUERY_TYPE[0].recordSize % $scope.pageSize > 0 ? 1 : 0);
                //外网
                $scope.QUERY_TYPE[1].recordList = data && data["f-inter"] ? data["f-inter"] : [];
                if ($scope.QUERY_TYPE[1].recordList) {
                    var recordList = [];
                    for (var ip in $scope.QUERY_TYPE[1].recordList) {
                        var record = $scope.QUERY_TYPE[1].recordList[ip];
                        record.ip = ip;
                        if (record.ipStatisticses && record.ipStatisticses.length) {
                            record.alias = record.ipStatisticses[0].alias;
                        }
                        recordList.push(record);
                    }
                    $scope.QUERY_TYPE[1].recordList = recordList;
                }
                $scope.QUERY_TYPE[1].recordSize = $scope.QUERY_TYPE[1].recordList ? $scope.QUERY_TYPE[1].recordList.length : 0;
                $scope.QUERY_TYPE[1].pageTotal = Math.floor($scope.QUERY_TYPE[1].recordSize / $scope.QUERY_TYPE[1].pageSize) + ($scope.QUERY_TYPE[1].recordSize % $scope.pageSize > 0 ? 1 : 0);
                //其他
                $scope.QUERY_TYPE[2].recordList = data && data["other"] ? data["other"] : [];
                if ($scope.QUERY_TYPE[2].recordList) {
                    var recordList = [];
                    for (var ip in $scope.QUERY_TYPE[2].recordList) {
                        var record = { ip: ip, ipStatisticses: $scope.QUERY_TYPE[2].recordList[ip] };
                        if (record.ipStatisticses && record.ipStatisticses.length)
                            record.alias = record.ipStatisticses[0].alias;
                        recordList.push(record);
                    }
                    $scope.QUERY_TYPE[2].recordList = recordList;
                }
                $scope.QUERY_TYPE[2].recordSize = $scope.QUERY_TYPE[2].recordList ? $scope.QUERY_TYPE[2].recordList.length : 0;
                $scope.QUERY_TYPE[2].pageTotal = Math.floor($scope.QUERY_TYPE[2].recordSize / $scope.QUERY_TYPE[2].pageSize) + ($scope.QUERY_TYPE[2].recordSize % $scope.pageSize > 0 ? 1 : 0);
                //查询详细信息
                if ($scope.queryType.recordList && $scope.queryType.recordList.length) {
                    $scope.changeTab($scope.queryType);
                }
                else {
                    for (var i = 0; i < $scope.QUERY_TYPE.length; i++) {
                        if ($scope.QUERY_TYPE[i].recordList && $scope.QUERY_TYPE[i].recordList.length) {
                            $scope.changeTab($scope.QUERY_TYPE[i]);
                            break;
                        }
                    }
                    if (!$scope.recordList) {
                        $scope.recordList = [];
                    }
                }
            });
        };
        //搜索
        $scope.search = function () {
            if (typeof $scope.startDateInput == "undefined" || $scope.startDateInput == null || $scope.startDateInput.length == 0)
                $scope.startDate = null;
            else
                $scope.startDate = $scope.startDateInput;
            if (typeof $scope.startTimeInput == "undefined" || $scope.startTimeInput == null || $scope.startTimeInput.length == 0)
                $scope.startTime = null;
            else
                $scope.startTime = $scope.startTimeInput;
            if (typeof $scope.keywordInput == "undefined" || $scope.keywordInput == null || $scope.keywordInput.length == 0)
                $scope.keyword = null;
            else
                $scope.keyword = $scope.keywordInput;
            if (typeof $scope.durationInput == "undefined" || $scope.durationInput == null || $scope.durationInput.length == 0)
                $scope.duration = null;
            else
                $scope.duration = $scope.durationInput;
            $scope.show(1);
        };
        //表单输入框按键事件
        $scope.formKeypressHandler = function (e) {
            if (e.keyCode == 13) {
                $scope.search();
            }
        };
        //点击tab页
        $scope.changeTab = function (tab) {
            if (tab) {
                $scope.queryType = tab;
                if (!$scope.keyword) {
                    $scope.show(1);
                }
                else {
                    $scope.recordList = $scope.queryType.recordList || [];
                    $scope.recordSize = $scope.queryType.recordSize || 0;
                    $scope.pageTotal = $scope.queryType.pageTotal || 0;
                    $scope.currentRecord = null;
                    $scope.currentSessionRecord = null;
                    $scope.doDetailQuery();
                    $scope.doSystemQuery();
                }
            }
        };
        //点击表格ip
        $scope.showDetail = function (record) {
            $scope.currentRecord = record;
        };
        //pcap下载
        $scope.downloadPcap = function (record) {
            var params = { queryType: "like" };
            if ($scope.startDate && $scope.startTime) {
                params.startTime = $scope.startDate + " " + $scope.startTime;
            }
            if ($scope.duration)
                params.duration = $scope.duration;
            if (record && record.ip)
                params.srcIp = record.ip;
            if (record.protocol)
                params.protocol = record.protocol;
            if (record.port)
                params.srcPort = record.port;
            $location.path("/flow/pcap").search(params);
        };
        //点击会话数图表
        $scope.showSessionModal = function (record) {
            if (!record)
                return;
            $scope.currentSessionRecord = record;
            if ($scope.recordList && $scope.recordList.length) {
                for (var i = 0; i < $scope.recordList.length; i++) {
                    if (record.ip == $scope.recordList[i].ip) {
                        for (var j = 0; j < $scope.recordList[i].detailList.length; j++) {
                            var detail = $scope.recordList[i].detailList[j];
                            if (detail.port == record.port && detail.protocol == record.protocol) {
                                $scope.currentSessionRecord.connDetails = detail.connDetails;
                                if ($scope.currentSessionRecord.connDetails && $scope.currentSessionRecord.connDetails.length) {
                                    for (var l = 0; l < $scope.currentSessionRecord.connDetails.length; l++) {
                                        var session = $scope.currentSessionRecord.connDetails[l];
                                        if (session.connectionString) {
                                            var strArr = session.connectionString.split(":");
                                            session.ip1 = strArr.length > 0 ? strArr[0] : null;
                                            session.port1 = strArr.length > 1 ? strArr[1] : null;
                                            session.ip2 = strArr.length > 2 ? strArr[2] : null;
                                            session.port2 = strArr.length > 3 ? strArr[3] : null;
                                            session.totalBytes = session.totalBytes ? (session.totalBytes * 8 / 1024).toFixed(1) : 0;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            $("#flow_history_session_modal").modal("show");
        };
        //获取url查询参数
        $scope.setSearchParams();
        if ($scope.keyword) {
            $scope.searchQuery();
        }
        else {
            $scope.doQuery();
        }

    });
});