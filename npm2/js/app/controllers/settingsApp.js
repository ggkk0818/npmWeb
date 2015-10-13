define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/settings.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('SettingsAppCtrl', function ($rootScope, $scope, $route, $timeout, $interval, $location, configAppService) {
        //初始化变量
        $scope.PROTOCOL_LIST = ["http", "mysql"];
        $scope.pageNum = 1;
        $scope.pageTotal = 1;
        $scope.pageSize = 10;
        $scope.recordSize = 0;
        $scope.recordList = null;
        $scope.keyword = null;
        //表单数据
        $scope.keywordInput = null;
        //弹出框变量
        $scope.showFormError = false;
        $scope.currentRecord = null;
        $scope.appNameInput = null;
        $scope.ipInput = null;
        $scope.protocolInput = null;
        $scope.ruleInput = null;
        $scope.effectiveInput = true;
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
                params.appName = $scope.keyword;
            }
            configAppService.configSearch(params, function (data) {
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
            $scope.currentRecord = record;
            $scope.appNameInput = record ? record.app_name : null;
            $scope.ipInput = record ? record.ip : null;
            $scope.protocolInput = record ? record.protocol : null;
            $scope.ruleInput = record ? record.rule : null;
            $scope.effectiveInput = record ? record.effective : false;
            $("#saveModal").modal("show");
        };
        //保存ip添加对话框
        $scope.saveModal = function () {
            $scope.msg = null;
            $scope.showFormError = false;
            if (!$scope.saveForm.$valid) {
                //$scope.msg = "请填写配置信息";
                $scope.showFormError = true;
                return;
            }
            var params = {
                "app_name": $scope.appNameInput,
                protocol: $scope.protocolInput,
                rule: $scope.ruleInput,
                effective: $scope.effectiveInput,
            };
            if ($scope.ipInput)
                params.ip = $scope.ipInput;
            if ($scope.currentRecord) {
                configAppService.configDelete({
                    "app_name": $scope.currentRecord.app_name
                }, function (data1) {
                    if (data1 && data1.status == 200) {
                        configAppService.configAdd(params, function (data) {
                            if (data && data.status == 200) {
                                $("#saveModal").modal("hide");
                                $scope.doQuery();
                            }
                            else {
                                $scope.msg = "保存失败";
                            }
                        });
                    }
                    else {
                        $scope.msg = "更新记录失败";
                    }
                });
            }
            else {
                configAppService.configAdd(params, function (data) {
                    if (data && data.status == 200) {
                        $("#saveModal").modal("hide");
                        $scope.doQuery();
                    }
                    else {
                        $scope.msg = "保存失败";
                    }
                });
            }
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
                configAppService.configDelete({
                    "app_name": $scope.currentRecord.app_name
                }, function (data) {
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