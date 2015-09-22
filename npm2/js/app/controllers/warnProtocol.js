define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/warnProtocol.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('WarnProtocolCtrl', function ($rootScope, $scope, $route, $timeout, $interval, $location, dateTimeService, warningService, flowService) {
        $scope.pageNum = 1;
        $scope.pageTotal = 1;
        $scope.pageSize = 5;
        $scope.recordSize = 0;
        $scope.recordList = null;
        $scope.startDate = null;
        $scope.queryTimer = null;
        $scope.isToday = false;

        $scope.init = function () {
            $scope.setSearchParams();
            $scope.doQuery();
            if ($scope.startDate == dateTimeService.serverTime.Format("yyyy-MM-dd")) {
                $scope.isToday = true;
            }
        };
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
            warningService.protocol(params, function (data) {
                $scope.success = data && data.status == 200 ? true : false;
                $scope.recordList = data && data.data ? data.data : [];
                $scope.recordSize = data && data.count ? data.count : 0;
                $scope.pageTotal = Math.floor($scope.recordSize / $scope.pageSize) + ($scope.recordSize % $scope.pageSize > 0 ? 1 : 0);
                //for (var i = 0; i < $scope.recordList.length; i++) {
                //    var record = $scope.recordList[i];
                //    if (typeof record.start_time === "number")
                //        record.start_time = new Date(record.start_time).Format("yyyy-MM-dd hh:mm:ss");
                //    if (typeof record.end_time === "number")
                //        record.end_time = new Date(record.end_time).Format("yyyy-MM-dd hh:mm:ss");
                //    if (record.type == 0 || record.type == 1) {
                //        $scope.doQueryDetail(record);
                //    }
                //    else if (record.type == 2) {
                //        $scope.doQueryFlowComparison(record);
                //    }
                //    else if (record.type == 3) {
                //        $scope.doQueryIpComparison(record);
                //    }
                //}
            });
        };
        $scope.init();
    });
});
