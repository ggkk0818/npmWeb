define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/warningSearch.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('WarningSearchCtrl', function ($rootScope, $scope, $route, $timeout, $location, warningService, logService) {
        //初始化变量
        $scope.LOG_TYPE = [
            { id: "iso8583", name: "8583告警" },
            { id: "iso20022", name: "20022告警" },
            { id: "http", name: "HTTP告警" },
            { id: "mysql", name: "MYSQL告警" }
        ];
        $scope.pageNum = 1;
        $scope.pageTotal = 1;
        $scope.pageSize = 10;
        $scope.recordSize = 0;
        $scope.recordList = null;
        $scope.keyword = null;
        $scope.srcIp = null;
        $scope.dstIp = null;
        $scope.startTime = null;
        $scope.endTime = null;
        $scope.logType = $scope.LOG_TYPE[0];
        //表单数据
        $scope.keywordInput = null;
        $scope.srcIpInput = null;
        $scope.dstIpInput = null;
        $scope.startTimeInput = $scope.startTime = new Date().Format("yyyy-MM-dd 00:00:00");
        $scope.endTimeInput = $scope.endTime = new Date().Format("yyyy-MM-dd 23:59:59");
        //获取查询参数
        $scope.getSearchParams = function () {
            var params = { pageNum: $scope.pageNum };
            if ($scope.keyword)
                params.keyword = $scope.keyword;
            if ($scope.srcIp)
                params.srcIp = $scope.srcIp;
            if ($scope.dstIp)
                params.dstIp = $scope.dstIp;
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
                    if (params.logType.toLowerCase() == $scope.LOG_TYPE[i].id)
                        $scope.logType = $scope.LOG_TYPE[i];
                }
            }
        };
        //显示告警信息
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
            var params = {
                type: $scope.logType.id,
                start: ($scope.pageNum - 1) * $scope.pageSize,
                limit: $scope.pageSize
            };
            if ($scope.keyword) {
                params.uid = $scope.keyword;
            }
            if ($scope.srcIp) {
                params.srcip = $scope.srcIp;
            }
            if ($scope.dstIp) {
                params.destip = $scope.dstIp;
            }
            if ($scope.startTime) {
                params.startWarnTime = $scope.startTime;
            }
            if ($scope.endTime) {
                params.endWarnTime = $scope.endTime;
            }
            warningService.list(params, function (data) {
                $scope.success = data && data.state == 200 ? true : false;
                $scope.recordList = data && data.data ? data.data : [];
                $scope.recordSize = data && data.count ? data.count : 0;
                $scope.pageTotal = Math.floor($scope.recordSize / $scope.pageSize) + ($scope.recordSize % $scope.pageSize > 0 ? 1 : 0);
                if ($scope.recordList && $scope.recordList.length) {
                    var uidList = [];
                    for (var i = 0; i < $scope.recordList.length; i++) {
                        var record = $scope.recordList[i];
                        uidList.push(record.uid);
                        if (typeof record.warnTime === "number")
                            record.warnTime = new Date(record.warnTime).Format("yyyy-MM-dd hh:mm:ss");
                    }
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
            });
        };
        //搜索告警信息
        $scope.search = function () {
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