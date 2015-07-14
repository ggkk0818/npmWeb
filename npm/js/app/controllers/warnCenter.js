define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/warnCenter.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('WarnCenterCtrl', function ($rootScope, $scope, $route, $timeout, $interval, $location, dateTimeService, warningService) {
        //初始化变量
        $scope.CURVE_TYPE = {
            0: { id: 0, name: "内网流量异常" },
            1: { id: 1, name: "外网流量异常" },
            2: { id: 2, name: "每日流量对比" },
            3: { id: 3, name: "每日ip对比" }
        };
        $scope.pageNum = 1;
        $scope.pageTotal = 1;
        $scope.pageSize = 10;
        $scope.recordSize = 0;
        $scope.recordList = null;
        $scope.startDate = null;
        $scope.queryTimer = null;
        $scope.isToday = false;
        //表单数据
        $scope.startDateInput = $scope.startDate = dateTimeService.serverTime.Format("yyyy-MM-dd");
        $scope.init = function () {
            $scope.setSearchParams();
            $scope.doQuery();
            if ($scope.startDate == dateTimeService.serverTime.Format("yyyy-MM-dd")) {
                $scope.isToday = true;
            }
        };
        //获取查询参数
        $scope.getSearchParams = function () {
            var params = { pageNum: $scope.pageNum };
            if ($scope.startDate)
                params.startTime = $scope.startDate;
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
                $scope.startDate = params.startTime;
                $scope.startDateInput = params.startTime;
            }
        };
        //显示信息
        $scope.show = function (pageNum) {
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
            if ($scope.startDate) {
                params.startTime = $scope.startDate + " 00:00:00";
                params.endTime = $scope.startDate + " 23:59:59";
            }
            warningService.curve(params, function (data) {
                $scope.success = data && data.status == 200 ? true : false;
                $scope.recordList = data && data.data ? data.data : [];
                $scope.recordSize = data && data.count ? data.count : 0;
                $scope.pageTotal = Math.floor($scope.recordSize / $scope.pageSize) + ($scope.recordSize % $scope.pageSize > 0 ? 1 : 0);
                for (var i = 0; i < $scope.recordList.length; i++) {
                    var record = $scope.recordList[i];
                    if (typeof record.start_time === "number")
                        record.start_time = new Date(record.start_time).Format("yyyy-MM-dd hh:mm:ss");
                    if (typeof record.end_time === "number")
                        record.end_time = new Date(record.end_time).Format("yyyy-MM-dd hh:mm:ss");
                }
            });
        };
        //搜索
        $scope.search = function () {
            if (typeof $scope.startDateInput == "undefined" || $scope.startDateInput == null || $scope.startDateInput.length == 0)
                $scope.startDate = null;
            else
                $scope.startDate = $scope.startDateInput;
            $scope.show(1);
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
            $scope.show(1);
        };
        //显示放大波形图
        $scope.showImageModal = function (record) {
            if (record) {
                $scope.currentRecord = record;
                $("#warn_center_image_modal").modal("show");
            }
        };

        $scope.init();
        //离开该页事件
        $scope.$on("$routeChangeStart", function () {
            if ($scope.queryTimer)
                $interval.cancel($scope.queryTimer);
        });

    });
});
