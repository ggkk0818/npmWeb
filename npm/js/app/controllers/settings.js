define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/settings.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('SettingsCtrl', function ($rootScope, $scope, $route, $timeout, settingsService) {
        $scope.init = function () {
            //初始化变量
            $scope.pageNum = 1;
            $scope.pageTotal = 1;
            $scope.pageSize = 10;
            $scope.keyword = null;
            $scope.recordSize = 10;
            //新建与编辑变量
            $scope.msg = null;
            $scope.recordId = null;
            $scope.recordName = null;
            $scope.recordValue = null;
            //查询数据
            $scope.queryWarnThreshold();
            $scope.queryPeopleBank();
            $scope.queryUnionpay();
        };
        //告警时延
        $scope.queryWarnThreshold = function () {
            settingsService.thresholdList({ start: 0, limit: $scope.pageSize }, function (data) {
                if (data && data.data) {
                    $scope.recordList_warnThreshold = data.data;
                }
            });
        };
        $scope.showWarnThresholdModal = function (warnThreshold) {
            $scope.msg = null;
            if (warnThreshold) {
                $scope.recordId = warnThreshold.id;
                $scope.recordName = warnThreshold.protocol;
                $scope.recordValue = warnThreshold.respmills;
            }
            else {
                $scope.recordId = null;
                $scope.recordName = null;
                $scope.recordValue = null;
            }
            $("#warnThresholdModal").modal("show");
        };
        $scope.saveWarnThreshold = function () {
            //表单数据检查
            if ($scope.warnThresholdForm.$invalid) {
                $scope.msg = "请正确输入表单信息再进行提交";
                return;
            }
            if ($scope.recordName && $scope.recordName.trim().length) {
                $scope.msg = null;
                var params = {};
                if ($scope.recordId)
                    params.id = $scope.recordId;
                if ($scope.recordName)
                    params.protocol = $scope.recordName;
                if ($scope.recordValue)
                    params.respmills = $scope.recordValue;
                if ($scope.recordId)
                    settingsService.thresholdUpdate(params, $scope.saveWarnThresholdDone);
                else
                    settingsService.thresholdSave(params, $scope.saveWarnThresholdDone);
            }
            else {
                $scope.msg = "请输入名称";
            }
        };
        $scope.saveWarnThresholdDone = function (data) {
            if (data && data.state == 200) {
                $("#warnThresholdModal").modal("hide");
                $scope.queryWarnThreshold();
            }
            else
                $scope.msg = data && data.msg ? data.msg : "保存失败";
        };
        //人行IP
        $scope.queryPeopleBank = function () {
            settingsService.peoplebankList({ start: 0, limit: $scope.pageSize }, function (data) {
                if (data && data.data) {
                    $scope.recordList_peopleBank = data.data;
                }
            });
        };
        $scope.showPeopleBankModal = function (peopleBank) {
            $scope.msg = null;
            if (peopleBank) {
                $scope.recordId = peopleBank.id;
                $scope.recordName = peopleBank.name;
                $scope.recordDescription = peopleBank.descript;
                $scope.recordValue = peopleBank.ip;
            }
            else {
                $scope.recordId = null;
                $scope.recordName = null;
                $scope.recordDescription = null;
                $scope.recordValue = null;
            }
            $("#peopleBankModal").modal("show");
        };
        $scope.savePeopleBank = function () {
            //表单数据检查
            if ($scope.peopleBankForm.$invalid) {
                $scope.msg = "请正确输入表单信息再进行提交";
                return;
            }
            if ($scope.recordName && $scope.recordName.trim().length) {
                $scope.msg = null;
                var params = {};
                if ($scope.recordId)
                    params.id = $scope.recordId;
                if ($scope.recordName)
                    params.name = $scope.recordName;
                if ($scope.recordDescription)
                    params.descript = $scope.recordDescription;
                if ($scope.recordValue)
                    params.ip = $scope.recordValue;
                if ($scope.recordId)
                    settingsService.peoplebankUpdate(params, $scope.savePeopleBankDone);
                else
                    settingsService.peoplebankSave(params, $scope.savePeopleBankDone);
            }
            else {
                $scope.msg = "请输入名称";
            }
        };
        $scope.savePeopleBankDone = function (data) {
            if (data && data.state == 200) {
                $("#peopleBankModal").modal("hide");
                $scope.queryPeopleBank();
            }
            else
                $scope.msg = data && data.msg ? data.msg : "保存失败";
        };


        // 银联 unionpay
        $scope.queryUnionpay = function () {
            settingsService.unionpayList({ start: 0, limit: $scope.pageSize }, function (data) {
                if (data && data.data) {
                    $scope.recordList_unionpay = data.data;
                }
            });
        };
        $scope.showUnionpayModal = function (unionpay) {
            $scope.msg = null;
            if (unionpay) {
                $scope.recordId = unionpay.id;
                $scope.recordName = unionpay.name;
                $scope.recordDescription = unionpay.descript;
                $scope.recordValue = unionpay.ip;
            }
            else {
                $scope.recordId = null;
                $scope.recordName = null;
                $scope.recordDescription = null;
                $scope.recordValue = null;
            }
            $("#unionpayModal").modal("show");
        };
        $scope.saveUnionpay = function () {
            //表单数据检查
            if ($scope.unionpayForm.$invalid) {
                $scope.msg = "请正确输入表单信息再进行提交";
                return;
            }
            if ($scope.recordName && $scope.recordName.trim().length) {
                $scope.msg = null;
                var params = {};
                if ($scope.recordId)
                    params.id = $scope.recordId;
                if ($scope.recordName)
                    params.name = $scope.recordName;
                if ($scope.recordDescription)
                    params.descript = $scope.recordDescription;
                if ($scope.recordValue)
                    params.ip = $scope.recordValue;
                if ($scope.recordId)
                    settingsService.unionpayUpdate(params, $scope.saveUnionpayDone);
                else
                    settingsService.unionpaySave(params, $scope.saveUnionpayDone);
            }
            else {
                $scope.msg = "请输入名称";
            }
        };
        $scope.saveUnionpayDone = function (data) {
            if (data && data.state == 200) {
                $("#unionpayModal").modal("hide");
                $scope.queryUnionpay();
            }
            else
                $scope.msg = data && data.msg ? data.msg : "保存失败";
        };


        //执行初始化
        $scope.init();
    });
});