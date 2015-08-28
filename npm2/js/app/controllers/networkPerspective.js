define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/networkPerspective.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('NetworkPerspectiveCtrl', function ($rootScope, $scope, $route, $interval, $location, $timeout, $window, dateTimeService, networkPerspectiveService) {
        //初始化变量
        $scope.keyword = null;
        $scope.recordList = null;
        $scope.startDate = null;
        $scope.startTime = null;
        $scope.endTime = null;
        //表单数据
        $scope.startDateInput = $scope.startDate = dateTimeService.serverTime.Format("yyyy-MM-dd");
        $scope.keywordInput = null;
        //初始化
        $scope.init = function () {
            $scope.setSearchParams();
            $scope.doQuery();
            $timeout(function () {
                $("#affix").affix({
                    offset: {
                        top: 200,
                        bottom: 50
                    }
                });
                $("body").scrollspy({ target: "#affix" })
            });
        };
        //获取查询参数
        $scope.getSearchParams = function () {
            var params = {};
            if ($scope.keyword)
                params.keyword = $scope.keyword;
            if ($scope.startDate)
                params.startDate = $scope.startDate;
            return params;
        };
        //从url获取查询参数设置变量
        $scope.setSearchParams = function () {
            var params = $location.search();
            if (!params)
                return;
            if (params.keyword) {
                $scope.keyword = params.keyword;
                $scope.keywordInput = params.keyword;
            }
            if (params.startDate) {
                $scope.startDate = params.startDate;
                $scope.startDateInput = params.startDate;
            }
            if (params.startTime)
                $scope.startTime = params.startTime;
            if (params.endTime)
                $scope.endTime = params.endTime;
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
                    else {
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
            var params = {};
            if ($scope.startDate) {
                params.startTime = $scope.startDate + " " + $scope.startTime;
                params.endTime = $scope.startDate + " " + $scope.endTime;
            }
            networkPerspectiveService.base(params, function (data) {
                $scope.success = data && data.status == 200 ? true : false;
                $scope.recordList = data && data.data ? data.data : [];
            });
            networkPerspectiveService.service(params, function (data) {
                $scope.serviceList = data && data.data ? data.data : [];
                for (var i = 0; i < $scope.serviceList.length; i++) {
                    var record = $scope.recordList[i];
                    if (typeof record.start_time === "number")
                        record.start_time = new Date(record.start_time).Format("yyyy-MM-dd hh:mm:ss");
                    if (typeof record.end_time === "number")
                        record.end_time = new Date(record.end_time).Format("yyyy-MM-dd hh:mm:ss");
                    $scope.doServiceDetailQuery(record);
                }
            });
        };
        //查询详情
        $scope.doServiceDetailQuery = function (record) {
            var params = {};
            if ($scope.startDate) {
                params.startTime = $scope.startDate + " " + $scope.startTime;
                params.endTime = $scope.startDate + " " + $scope.endTime;
            }
            networkPerspectiveService.serviceDetail(params, function (data) {
                if (data && data.status == 200 && data.data) {
                    $.extend(record, data.data);
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
        //时间选择器事件
        $scope.$on("rangeSlideValuesChanged", function (e, $context, elem, event, data) {
            if (data.values.min instanceof Date)
                $scope.startTime = data.values.min.Format("hh:mm:ss");
            if (data.values.max instanceof Date)
                $scope.endTime = data.values.max.Format("hh:mm:ss");
            $scope.recordList = null;
            $scope.serviceList = null;
            $scope.doQuery();
        });
        //离开该页事件
        $scope.$on("$routeChangeStart", function () {
        });
        //执行初始化
        $scope.init();
    });
});