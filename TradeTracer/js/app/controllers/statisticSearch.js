define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/statisticSearch.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('StatisticSearchCtrl', function ($rootScope, $scope, $route, $timeout, $location, statisticService) {
        //初始化变量
        $scope.LOG_TYPE = [
            { id: "8583", name: "8583" },
            { id: "20022", name: "20022" }
        ];
        $scope.pageNum = 1;
        $scope.pageTotal = 1;
        $scope.pageSize = 10;
        $scope.recordSize = 0;
        $scope.duration = null;
        $scope.startTime = null;
        $scope.endTime = null;
        $scope.logType = $scope.LOG_TYPE[0];
        //表单数据
        $scope.durationInput = null;
        //获取查询参数
        $scope.getSearchParams = function () {
            var params = { pageNum: $scope.pageNum };
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
            var params = {
                logType: $scope.logType.id,
                start: ($scope.pageNum - 1) * $scope.pageSize,
                limit: $scope.pageSize
            };
            if ($scope.duration) {
                if ($scope.duration.indexOf("-") > -1) {
                    var arr = $scope.duration.split("-");
                    if (arr && arr.length && arr[0].length) {
                        params.srespmills = arr[0];
                    }
                    if (arr && arr.length > 1 && arr[1].length) {
                        params.erespmills = arr[1];
                    }
                }
                else {
                    params.srespmills = params.erespmills = $scope.duration;
                }
            }
            if ($scope.startTime) {
                params.stime = $scope.startTime;
            }
            if ($scope.endTime) {
                params.etime = $scope.endTime;
            }
            statisticService.list(params, function (data) {
                $scope.success = data && data.state == 200 ? true : false;
                $scope.recordList = data && data.data ? data.data : [];
                $scope.recordSize = data && data.count ? data.count : 0;
                $scope.pageTotal = Math.floor($scope.recordSize / $scope.pageSize) + ($scope.recordSize % $scope.pageSize > 0 ? 1 : 0);
                if ($scope.recordList && $scope.recordList.length) {
                    for (var i = 0; i < $scope.recordList.length; i++) {
                        var record = $scope.recordList[i];
                        if (typeof record.starttime_prefix === "number")
                            record.starttime_prefix = new Date(record.starttime_prefix).Format("yyyy-MM-dd hh:mm:ss");
                        if (typeof record.endtime_prefix === "number")
                            record.endtime_prefix = new Date(record.endtime_prefix).Format("yyyy-MM-dd hh:mm:ss");
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