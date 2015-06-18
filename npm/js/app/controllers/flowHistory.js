define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/flowHistory.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('FlowHistoryCtrl', function ($rootScope, $scope, $route, $timeout, $interval, $location, dateTimeService, flowService) {
        //初始化变量
        $scope.QUERY_TYPE = [
            { name: "follow", displayName: "关注" },
            { name: "normal", displayName: "其他" }
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
            if ($scope.queryType.name == $scope.QUERY_TYPE[0].name)
                flowService.follow(params, $scope.doQueryDone);
            else
                flowService.unfollow(params, $scope.doQueryDone);
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
            }
        };
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
            if ($scope.queryType.name == $scope.QUERY_TYPE[0].name)
                flowService.followDetail(params, $scope.doDetailQueryDone);
            else
                flowService.unfollowDetail(params, $scope.doDetailQueryDone);
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
                $scope.show(1);
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
                                for (var k = 0; k < detail.ipDetailResults.length; k++) {
                                    if (detail.ipDetailResults[k].time == record.time) {
                                        $scope.currentSessionRecord.connDetails = detail.ipDetailResults[k].connDetails;
                                        break;
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
        $scope.doQuery();

    });
});