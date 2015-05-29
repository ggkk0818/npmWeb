﻿define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/flowPcap.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('FlowPcapCtrl', function ($rootScope, $scope, $route, $timeout, $interval, $location, flowService) {
        //初始化变量
        $scope.QUERY_TYPE = [
            { name: "ip", displayName: "IP" },
            { name: "mac", displayName: "MAC" },
            { name: "protocol", displayName: "协议" },
            { name: "port", displayName: "端口" }
        ];
        $scope.queryType = $scope.QUERY_TYPE[0];
        //表单数据
        $scope.startDateInput = null;
        $scope.startTimeInput = null;
        $scope.durationInput = null;
        $scope.protocolInput = null;
        $scope.srcIpInput = null;
        $scope.srcPortInput = null;
        $scope.destIpInput = null;
        $scope.destPortInput = null;
        $scope.srcMacInput = null;
        $scope.destMacInput = null;

        $scope.doQuery = function () {
            $scope.fileName = null;
            $scope.msg = null;
            var params = {};
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
                catch (e) { }
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
            flowService.pcapSearch(params, function (data) {
                if (data && data.fileName) {
                    $scope.fileName = data.fileName;
                }
                else {
                    $scope.msg = "暂无结果";
                }
            });
        };

        $scope.doDownload = function () {
            if ($scope.fileName)
                window.open("pcap/download?file=" + encodeURIComponent($scope.fileName));
        };
    });
});