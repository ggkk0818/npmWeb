define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/statisticSearch.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('FlowDetailCtrl', function ($rootScope, $scope, $route, $timeout, $interval, $location, flowService) {
        //初始化变量
        $scope.QUERY_TYPE = [
            { name: "ip", displayName: "IP" },
            { name: "mac", displayName: "MAC" },
            { name: "protocol", displayName: "协议" },
            { name: "port", displayName: "端口" }
        ];
        $scope.recordList = 0;
        $scope.startDate = null;
        $scope.startTime = null;
        $scope.queryType = $scope.QUERY_TYPE[0];
        $scope.queryTimer = null;
        //表单数据
        $scope.startDateInput = null;
        $scope.startTimeInput = null;
        //获取查询参数
        $scope.getSearchParams = function () {
            var params = {};
            if ($scope.startTime)
                params.startTime = $scope.startDate + " " + $scope.startTime;
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
            if (params.queryType) {
                for (var i = 0; i < $scope.QUERY_TYPE.length; i++) {
                    if (params.queryType == $scope.QUERY_TYPE[i].name)
                        $scope.queryType = $scope.QUERY_TYPE[i];
                }
            }
        };
        //显示统计信息
        $scope.show = function () {
            $scope.isLoading = true;
            var params = $scope.getSearchParams();
            if (_.isEqual(params, $location.search()))
                params.refresh = true;
            $location.search(params);
        };

        $scope.doQuery = function () {
            var params = {};
            if ($scope.startDate && $scope.startTime) {
                params.datetime = $scope.startDate + " " + $scope.startTime;
            }
            flowService[$scope.queryType.name].call(this, params, function (data) {
                $scope.recordList = data && data.data ? data.data : [];
                if ($scope.recordList && $scope.recordList.length) {
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
            $scope.show();
        };
        //表单输入框按键事件
        $scope.formKeypressHandler = function (e) {
            if (e.keyCode == 13) {
                $scope.search();
            }
        };
        //重置查询条件
        $scope.reset = function () {
            $scope.startDate = null;
            $scope.startTime = null;
            $scope.show();
        };
        //点击tab页
        $scope.changeTab = function (tab) {
            if (tab) {
                $scope.queryType = tab;
                $scope.show();
            }
        };
        //离开该页事件
        $scope.$on("$routeChangeStart", function () {
            if ($scope.queryTimer)
                $interval.cancel($scope.queryTimer);
        });
        //获取url查询参数
        $scope.setSearchParams();
        $scope.doQuery();
        //无日期条件每秒查询实时数据
        if (!$scope.startTime) {
            $scope.queryTimer = $interval($scope.doQuery, 1000);
        }
    });
});