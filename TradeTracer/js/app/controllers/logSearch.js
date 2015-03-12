define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/logSearch.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('LogSearchCtrl', function ($rootScope, $scope, $route, $timeout, $location, logService) {
        //初始化变量
        $scope.LOG_TYPE = [
            { id: "8583", name: "8583" },
            { id: "20022", name: "20022" }
        ];
        $scope.pageNum = 1;
        $scope.pageTotal = 1;
        $scope.pageSize = 10;
        $scope.recordSize = 0;
        $scope.keyword = null;
        $scope.startTime = null;
        $scope.endTime = null;
        $scope.logType = $scope.LOG_TYPE[0];
        //表单数据
        $scope.keywordInput = null;
        //获取查询参数
        $scope.getSearchParams = function () {
            var params = { pageNum: $scope.pageNum };
            if ($scope.keyword)
                params.keyword = $scope.keyword;
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
        //显示日志
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
                from: ($scope.pageNum - 1) * $scope.pageSize,
                size: $scope.pageSize
            };
            if ($scope.keyword)
                params.aggregateKey = $scope.keyword;
            if ($scope.startTime) {
                var time = new Date($scope.startTime);
                params.stime = time.Format("MM/dd/yyyy-hh:mm:ss");
            }
            if ($scope.endTime) {
                var time = new Date($scope.endTime);
                params.etime = time.Format("MM/dd/yyyy-hh:mm:ss");
            }
            logService.list(params, function (data) {
                $scope.success = data && data.state == 200 ? true : false;
                $scope.recordList = data ? data.data : [];
                $scope.recordSize = data ? data.count : 0;
                $scope.pageTotal = Math.floor($scope.recordSize / $scope.pageSize) + ($scope.recordSize % $scope.pageSize > 0 ? 1 : 0);
                $scope.isLoading = false;
            });
        };
        //搜索日志
        $scope.search = function () {
            if (typeof $scope.keywordInput == "undefined" || $scope.keywordInput == null || $scope.keywordInput.length == 0)
                $scope.keyword = null;
            else
                $scope.keyword = $scope.keywordInput;
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