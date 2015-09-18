define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/settings.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('SettingsWarnCtrl', function ($rootScope, $scope, $route, $timeout, $interval, $location, configWarnProtocolService) {
        //初始化变量
        $scope.DURATION_TYPE = {
            30: { name: "30秒", type: "second", value: 30 },
            60: { name: "1分钟", type: "minute", value: 60 },
            300: { name: "5分钟", type: "minute", value: 300 },
            900: { name: "15分钟", type: "minute", value: 900 },
            3600: { name: "1小时", type: "hour", value: 3600 },
        };
        $scope.pageNum = 1;
        $scope.pageTotal = 1;
        $scope.pageSize = 10;
        $scope.recordSize = 0;
        $scope.recordList = null;
        $scope.keyword = null;
        //表单数据
        $scope.keywordInput = null;
        //弹出框变量
        $scope.periodInput = null;
        $scope.protocolInput = null;
        $scope.successRateInput = null;
        $scope.avgDelayInput = null;
        $scope.isUpdateInput = false;
        //获取查询参数
        $scope.getSearchParams = function () {
            var params = { pageNum: $scope.pageNum };
            if ($scope.keyword)
                params.keyword = $scope.keyword;
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
        };
        //显示信息
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
                start: ($scope.pageNum - 1) * $scope.pageSize,
                limit: $scope.pageSize
            };
            if ($scope.keyword) {
                params.protocol = $scope.keyword;
            }
            configWarnProtocolService.configSearch(params, function (data) {
                $scope.success = data && data.status == 200 ? true : false;
                $scope.recordList = data && data.data ? data.data : [];
                $scope.recordSize = data && data.count ? data.count : 0;
                $scope.pageTotal = Math.floor($scope.recordSize / $scope.pageSize) + ($scope.recordSize % $scope.pageSize > 0 ? 1 : 0);
            });
        };
        //搜索
        $scope.search = function () {
            if (typeof $scope.keywordInput == "undefined" || $scope.keywordInput == null || $scope.keywordInput.length == 0)
                $scope.keyword = null;
            else
                $scope.keyword = $scope.keywordInput;
            $scope.show(1);
        };
        //表单输入框按键事件
        $scope.formKeypressHandler = function (e) {
            if (e.keyCode == 13) {
                $scope.search();
            }
        };
        //显示ip添加对话框
        $scope.showSaveModal = function (record) {
            $scope.periodInput = record && record.id ? ($scope.DURATION_TYPE[record.id.period] ? $scope.DURATION_TYPE[record.id.period] : record.id.period) : null;
            $scope.protocolInput = record && record.id ? record.id.protocol : null;
            $scope.successRateInput = record ? record.threshold_success_rate : null;
            $scope.avgDelayInput = record ? record.threshold_avg_delay : null;
            $scope.isUpdateInput = record ? record.is_update : false;
            $("#saveModal").modal("show");
        };
        //保存ip添加对话框
        $scope.saveModal = function () {
            $scope.msg = null;
            if (!$scope.saveForm.$valid || !$scope.periodInput) {
                $scope.msg = "请填写配置信息";
                return;
            }
            var params = {
                "id.period": $scope.periodInput.value || $scope.periodInput,
                "id.protocol": $scope.protocolInput,
                threshold_success_rate: $scope.successRateInput,
                threshold_avg_delay: $scope.avgDelayInput,
                is_update: true,
            };
            configWarnProtocolService.configAdd(params, function (data) {
                if (data && data.status == 200) {
                    $("#saveModal").modal("hide");
                    $scope.doQuery();
                }
                else {
                    $scope.msg = "保存失败";
                }
            });
        };
        //显示ip删除对话框
        $scope.showDeleteModal = function (record) {
            $scope.currentRecord = record;
            $("#deleteModal").modal("show");
        };
        //删除ip
        $scope.deleteModal = function () {
            if ($scope.currentRecord) {
                $scope.msg = null;
                configWarnProtocolService.configDelete({ id: $scope.currentRecord.id }, function (data) {
                    if (data && data.status == 200) {
                        $("#deleteModal").modal("hide");
                        $scope.doQuery();
                    }
                    else {
                        $scope.msg = "删除失败";
                    }
                });
            }
        };
        //获取url查询参数
        $scope.setSearchParams();
        $scope.doQuery();

    });
});