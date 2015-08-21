define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/index.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('ServerViewCtrl', function ($rootScope, $scope, $route, $interval, $location, $timeout, $window, dateTimeService, networkOverviewService) {
        //初始化变量
        $scope.QUERY_TYPE = [
            { name: "ip", displayName: "按IP模式" },
            { name: "protocol", displayName: "按协议模式" }
        ];
        $scope.pageNum = 1;
        $scope.pageTotal = 1;
        $scope.pageSize = 10;
        $scope.recordSize = 0;
        $scope.recordList = null;
        $scope.startDate = null;
        $scope.startTime = null;
        $scope.endTime = null;
        $scope.queryType = $scope.QUERY_TYPE[0];
        //表单数据
        $scope.startDateInput = $scope.startDate = dateTimeService.serverTime.Format("yyyy-MM-dd");
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
            if ($scope.queryType)
                params.queryType = $scope.queryType.name;
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
                for (var i = 0; i < $scope.QUERY_TYPE.length; i++) {
                    if (params.queryType == $scope.QUERY_TYPE[i].name)
                        $scope.queryType = $scope.QUERY_TYPE[i];
                }
            }
            if (!$scope.startTime || !$scope.endTime) {
                var today = new Date($scope.startDate.replace(/-/g, "/"));
                if (!$scope.endTime) {
                    if ($scope.startTime) {
                        var time = new Date($scope.startDate.replace(/-/g, "/") + " " + $scope.startTime);
                        time.setHours(time.getHours() + 5);
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
                    time.setHours(time.getHours() - 5);
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
                start: ($scope.pageNum - 1) * $scope.pageSize,
                limit: $scope.pageSize
            };
            if ($scope.startDate) {
                params.startTime = $scope.startDate + " " + $scope.startTime;
                params.endTime = $scope.startDate + " " + $scope.endTime;
            }
            networkOverviewService.serviceIp(params, function (data) {
                $scope.success = data && data.status == 200 ? true : false;
                $scope.recordList = data && data.data ? data.data : [];
                $scope.recordSize = data && data.count ? data.count : 0;
                $scope.pageTotal = Math.floor($scope.recordSize / $scope.pageSize) + ($scope.recordSize % $scope.pageSize > 0 ? 1 : 0);
                for (var i = 0; i < $scope.recordList.length; i++) {
                    var record = { ip: $scope.recordList[i] };
                    if (typeof record.start_time === "number")
                        record.start_time = new Date(record.start_time).Format("yyyy-MM-dd hh:mm:ss");
                    if (typeof record.end_time === "number")
                        record.end_time = new Date(record.end_time).Format("yyyy-MM-dd hh:mm:ss");
                    $scope.recordList[i] = record;
                }
                $scope.doDetailQuery();
            });
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
            if ($scope.startDate) {
                params.startTime = $scope.startDate + " " + $scope.startTime;
                params.endTime = $scope.startDate + " " + $scope.endTime;
            }
            networkOverviewService.system(params, function (data) {
                if ($scope.recordList && $scope.recordList.length) {
                    if (data && data.status == 200 && data.data) {
                        for (var i = 0; i < data.data.length; i++) {
                            var detail = data.data[i];
                            for (var j = 0; j < $scope.recordList.length; j++) {
                                var record = $scope.recordList[j];
                                if (detail.ip === record.ip) {
                                    $.extend(record, detail);
                                    if (record.uptimeMins) {
                                        record.hasUpTimes = true;
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
        //搜索
        $scope.search = function () {
            if (typeof $scope.startDateInput == "undefined" || $scope.startDateInput == null || $scope.startDateInput.length == 0)
                $scope.startDate = null;
            else
                $scope.startDate = $scope.startDateInput;
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
        //点击tab页
        $scope.changeTab = function (tab) {
            if (tab) {
                $scope.queryType = tab;
                $scope.show();
            }
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