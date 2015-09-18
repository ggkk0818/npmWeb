define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/flowPcap.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('FlowPcapCtrl', function ($rootScope, $scope, $route, $timeout, $interval, $location, flowService, pcapService, dateTimeService) {
        //初始化变量
        $scope.QUERY_TYPE = [
            {name: "ip", displayName: "IP"},
            {name: "mac", displayName: "MAC"},
            {name: "protocol", displayName: "协议"},
            {name: "port", displayName: "端口"}
        ];
        $scope.queryType = $scope.QUERY_TYPE[0];
        $scope.isLoading = false;
        //表单数据
        $scope.startDateInput = new Date(dateTimeService.serverTime.getTime() - 30 * 60 * 1000).Format("yyyy-MM-dd");
        $scope.startTimeInput = new Date(dateTimeService.serverTime.getTime() - 30 * 60 * 1000).Format("hh:mm:ss");
        $scope.durationInput = 10;
        $scope.protocolInput = null;
        $scope.srcIpInput = null;
        $scope.srcPortInput = null;
        $scope.destIpInput = null;
        $scope.destPortInput = null;
        $scope.srcMacInput = null;
        $scope.destMacInput = null;
        $scope.queryTypeInput = "equal";

        // 分页参数
        $scope.pageNum = 1;
        $scope.pageTotal = 1;
        $scope.recordList = null;


        //获取查询参数
        $scope.getSearchParams = function () {
            var params = {pageNum: $scope.pageNum};
            if ($scope.startDateInput && $scope.startTimeInput)
                params.startTime = $scope.startDateInput + " " + $scope.startTimeInput;
            if ($scope.durationInput)
                params.duration = $scope.durationInput;
            if ($scope.protocolInput)
                params.protocol = $scope.protocolInput;
            if ($scope.srcIpInput)
                params.srcIp = $scope.srcIpInput;
            if ($scope.srcPortInput)
                params.srcPort = $scope.srcPortInput;
            if ($scope.destIpInput)
                params.destIp = $scope.destIpInput;
            if ($scope.destPortInput)
                params.destPort = $scope.destPortInput;
            if ($scope.srcMacInput)
                params.srcMac = $scope.srcMacInput;
            if ($scope.destMacInput)
                params.destMac = $scope.destMacInput;
            if ($scope.queryTypeInput)
                params.queryType = $scope.queryTypeInput;
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
                var arr = params.startTime.split(" ");
                $scope.startDateInput = arr[0];
                $scope.startTimeInput = arr[1];
            }
            if (params.duration) {
                $scope.durationInput = params.duration;
            }
            if (params.protocol) {
                $scope.protocolInput = params.protocol;
            }
            if (params.srcIp) {
                $scope.srcIpInput = params.srcIp;
            }
            if (params.srcPort) {
                $scope.srcPortInput = params.srcPort;
            }
            if (params.destIp) {
                $scope.destIpInput = params.destIp;
            }
            if (params.destPort) {
                $scope.destPortInput = params.destPort;
            }
            if (params.srcMac) {
                $scope.srcMacInput = params.srcMac;
            }
            if (params.destMac) {
                $scope.destMacInput = params.destMac;
            }
            if (params.queryType) {
                $scope.queryTypeInput = params.queryType;
            }
        };
        //显示信息
        $scope.show = function (pageNum) {
            if (!$scope.startDateInput || !$scope.startTimeInput || !$scope.durationInput) {
                $scope.msg = "请填写时间";
                return;
            }
            if (pageNum)
                $scope.pageNum = pageNum;
            var params = $scope.getSearchParams();
            if (_.isEqual(params, $location.search()))
                params.refresh = true;
            $location.search(params);
        };
        // 下载
        $scope.download = function () {
            var params = {page: $scope.pageNum};
            if ($scope.startDateInput && $scope.startTimeInput) {
                params.startTime = $scope.startDateInput + " " + $scope.startTimeInput;
            }
            if (params.startTime && $scope.durationInput) {
                try {
                    var duration = parseInt($scope.durationInput, 10),
                        startTime = new Date(params.startTime.replace(/-/g, "/"));
                    if (!isNaN(duration)) {
                        startTime.setSeconds(startTime.getSeconds() + duration);
                        params.endTime = startTime.Format("yyyy-MM-dd hh:mm:ss");
                    }
                }
                catch (e) {
                }
            }
            if ($scope.protocolInput)
                params.proto = $scope.protocolInput;
            if ($scope.srcIpInput)
                params.srcIp = $scope.srcIpInput;
            if ($scope.srcPortInput)
                params.srcPort = $scope.srcPortInput;
            if ($scope.destIpInput)
                params.dstIp = $scope.destIpInput;
            if ($scope.destPortInput)
                params.dstPort = $scope.destPortInput;
            if ($scope.srcMacInput)
                params.srcMac = $scope.srcMacInput;
            if ($scope.destMacInput)
                params.dstMac = $scope.destMacInput;
            if ($scope.queryTypeInput)
                params.searchType = $scope.queryTypeInput;
            var url = "pcap/download?" + $.param(params);
            window.open(url);
        };

        $scope.doQuery = function () {
            $scope.fileName = null;
            $scope.msg = null;
            var params = {page: $scope.pageNum};

            if ($scope.startDateInput && $scope.startTimeInput) {
                params.startTime = $scope.startDateInput + " " + $scope.startTimeInput;
            }
            if (params.startTime && $scope.durationInput) {
                try {
                    var duration = parseInt($scope.durationInput, 10),
                        startTime = new Date(params.startTime.replace(/-/g, "/"));
                    if (!isNaN(duration)) {
                        startTime.setSeconds(startTime.getSeconds() + duration);
                        params.endTime = startTime.Format("yyyy-MM-dd hh:mm:ss");
                    }
                }
                catch (e) {
                }
            }
            if ($scope.protocolInput)
                params.proto = $scope.protocolInput;
            if ($scope.srcIpInput)
                params.srcIp = $scope.srcIpInput;
            if ($scope.srcPortInput)
                params.srcPort = $scope.srcPortInput;
            if ($scope.destIpInput)
                params.dstIp = $scope.destIpInput;
            if ($scope.destPortInput)
                params.dstPort = $scope.destPortInput;
            if ($scope.srcMacInput)
                params.srcMac = $scope.srcMacInput;
            if ($scope.destMacInput)
                params.dstMac = $scope.destMacInput;
            if ($scope.queryTypeInput)
                params.searchType = $scope.queryTypeInput;
            $scope.isLoading = true;
            flowService.pcapSearch(params, function (data) {
                if (data && data.packets) {
                    $scope.recordList = data.packets;
                    $scope.pageTotal = data.pageCount;
                }
                else if (data && data.status == 500) {
                    $scope.msg = "查询失败";
                }
                else {
                    $scope.msg = "暂无结果";
                }
                $scope.isLoading = false;
            });
        };

        $scope.doDownload = function () {
            if ($scope.fileName)
                window.open("pcap/download?file=" + encodeURIComponent($scope.fileName));
        };

        //获取url查询参数
        $scope.setSearchParams();
        if ($scope.startDateInput && $scope.startTimeInput)
            $scope.doQuery();
    });
});