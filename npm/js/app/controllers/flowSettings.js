define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/flowPcap.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('FlowSettingsCtrl', function ($rootScope, $scope, $route, $timeout, $interval, $location, flowService) {
        //初始化变量
        $scope.pageNum = 1;
        $scope.pageTotal = 1;
        $scope.pageSize = 10;
        $scope.recordSize = 0;
        $scope.recordList = null;
        $scope.keyword = null;
        $scope.ip = null;
        //表单数据
        $scope.keywordInput = null;
        $scope.searchIpInput = null;
        //IP对话框变量
        $scope.recordId = null;
        $scope.ipInput = null;
        $scope.attentionInput = null;
        $scope.nameInput = null;
        //详情对话框变量
        $scope.portInput = null;
        $scope.protocolInput = null;
        //获取查询参数
        $scope.getSearchParams = function () {
            var params = { pageNum: $scope.pageNum };
            if ($scope.keyword)
                params.keyword = $scope.keyword;
            if ($scope.ip)
                params.ip = $scope.ip;
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
            if (params.ip) {
                $scope.ip = params.ip;
                $scope.searchIpInput = params.ip;
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
                params.alias = $scope.keyword;
            }
            if ($scope.ip) {
                params.ip = $scope.ip;
            }
            flowService.settings(params, function (data) {
                $scope.success = data && data.status == 200 ? true : false;
                $scope.recordList = data && data.data ? data.data : [];
                $scope.recordSize = data && data.count ? data.count : 0;
                $scope.pageTotal = Math.floor($scope.recordSize / $scope.pageSize) + ($scope.recordSize % $scope.pageSize > 0 ? 1 : 0);
                if ($scope.recordList && $scope.recordList.length) {
                    var uidList = [];
                    for (var i = 0; i < $scope.recordList.length; i++) {
                        var record = $scope.recordList[i];
                        if (typeof record.warnTime === "number")
                            record.warnTime = new Date(record.warnTime).Format("yyyy-MM-dd hh:mm:ss");
                    }
                }
            });
        };
        //搜索
        $scope.search = function () {
            if (typeof $scope.keywordInput == "undefined" || $scope.keywordInput == null || $scope.keywordInput.length == 0)
                $scope.keyword = null;
            else
                $scope.keyword = $scope.keywordInput;
            if (typeof $scope.searchIpInput == "undefined" || $scope.searchIpInput == null || $scope.searchIpInput.length == 0)
                $scope.ip = null;
            else
                $scope.ip = $scope.searchIpInput;
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
            $scope.recordId = record ? record.id : null;
            $scope.ipInput = record ? record.ip : null;
            $scope.attentionInput = record ? record.is_attention : null;
            $scope.nameInput = record ? record.alias : null;
            $("#saveModal").modal("show");
        };
        //保存ip添加对话框
        $scope.saveModal = function () {
            $scope.msg = null;
            if (!$scope.saveForm.$valid) {
                $scope.msg = "请填写标题";
                return;
            }
            if ($scope.recordId) {
                var params = { id: $scope.recordId, ip: $scope.ipInput };
                if ($scope.nameInput)
                    params.alias = $scope.nameInput;
                if ($scope.attentionInput)
                    params.is_attention = $scope.attentionInput;
                else
                    params.is_attention = false;
                flowService.settingsUpdate(params, function (data) {
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
                var params = { ip: $scope.ipInput };
                if ($scope.nameInput)
                    params.alias = $scope.nameInput;
                if ($scope.attentionInput)
                    params.is_attention = $scope.attentionInput;
                flowService.settingsSave(params, function (data) {
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
                flowService.settingsDelete({ id: $scope.currentRecord.id }, function (data) {
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
        //显示详情对话框
        $scope.showDetailSaveModal = function (record, detail) {
            $scope.currentRecord = record;
            $scope.recordId = detail ? detail.id : null;
            $scope.portInput = detail ? detail.port : null;
            $scope.protocolInput = detail ? detail.protocol : null;
            $scope.nameInput = detail ? detail.alias : null;
            $("#detailSaveModal").modal("show");
        };
        //保存详情添加对话框
        $scope.saveDetailModal = function () {
            $scope.msg = null;
            if (!$scope.detailSaveForm.$valid) {
                $scope.msg = "请填写端口";
                return;
            }
            if ($scope.recordId) {
                var params = { id: $scope.recordId, port: $scope.portInput };
                params["ipConfig.id"] = $scope.currentRecord.id;
                if ($scope.nameInput)
                    params.alias = $scope.nameInput;
                if ($scope.protocolInput)
                    params.protocol = $scope.protocolInput;
                flowService.settingsDetailUpdate(params, function (data) {
                    if (data && data.status == 200) {
                        $("#detailSaveModal").modal("hide");
                        $scope.doQuery();
                    }
                    else {
                        $scope.msg = "保存失败";
                    }
                });
            }
            else {
                var params = { port: $scope.portInput };
                params["ipConfig.id"] = $scope.currentRecord.id;
                if ($scope.nameInput)
                    params.alias = $scope.nameInput;
                if ($scope.protocolInput)
                    params.protocol = $scope.protocolInput;
                flowService.settingsDetailSave(params, function (data) {
                    if (data && data.status == 200) {
                        $("#detailSaveModal").modal("hide");
                        $scope.doQuery();
                    }
                    else {
                        $scope.msg = "保存失败";
                    }
                });
            }
        };
        //显示详情删除对话框
        $scope.showDetailDeleteModal = function (record) {
            $scope.currentDetail = record;
            $("#detailDeleteModal").modal("show");
        };
        //删除详情
        $scope.deleteDetailModal = function () {
            if ($scope.currentDetail) {
                $scope.msg = null;
                flowService.settingsDetailDelete({ id: $scope.currentDetail.id }, function (data) {
                    if (data && data.status == 200) {
                        $("#detailDeleteModal").modal("hide");
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