define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/protocol.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('ProtocolCtrl', function ($rootScope, $scope, $route, $timeout, $location, protocolService) {
        //初始化变量
        $scope.FIELD_LIST = {};
        $scope.FIELD_OPT = {
            "String": [
                { name: "=", displayName: "等于" },
                { name: "!=", displayName: "不等于" },
                { name: "like", displayName: "包含" }
            ],
            "Date": [
                { name: "=", displayName: "等于" },
                { name: ">=", displayName: ">=" },
                { name: "<=", displayName: "<=" },
                { name: "><", displayName: "介于" }
            ],
            "Int": [
                { name: "=", displayName: "等于" },
                { name: "!=", displayName: "不等于" },
                { name: "><", displayName: "介于" }
            ],
        };
        $scope.queryFieldList = {};
        $scope.groupFieldList = {};
        $scope.groupFieldCount = 0;
        $scope.displayFieldList = {};
        //普通查询变量
        $scope.pageNum = 1;
        $scope.pageTotal = 1;
        $scope.pageSize = 10;
        $scope.recordSize = 0;
        $scope.recordList = null;
        //分组查询变量
        $scope.groupRecordList = {};
        $scope.isGroupMode = false;

        $scope.protocolType = null;

        $scope.init = function () {
            if ($route.current.params.protocol) {
                $scope.protocolType = $route.current.params.protocol;
            }
            else {
                return;
            }
            protocolService.fields({ name: $scope.protocolType }, function (data) {
                if (data && data.fields) {
                    for (var i = 0; i < data.fields.length; i++) {
                        var field = data.fields[i];
                        $scope.FIELD_LIST[field.name] = field;
                        $scope.displayFieldList[field.name] = field;
                    }
                }
            });
        };

        $scope.addFilter = function (field) {
            if (field)
                $scope.queryFieldList[field.name] = field;
        };
        $scope.removeFilter = function (field) {
            if (field)
                delete $scope.queryFieldList[field.name];
        };

        $scope.toggleGroup = function (field) {
            if (field) {
                if($scope.groupFieldList[field.name])
                    delete $scope.groupFieldList[field.name];
                else
                    $scope.groupFieldList[field.name] = field;
                $scope.groupFieldCount = getGroupFieldCount();
            }
        };
        var getGroupFieldCount = function () {
            var r = 0;
            for (var index in $scope.groupFieldList)
                r++;
            return r;
        };

        $scope.toggleDisplayField = function (field) {
            if (!field)
                return;
            if (!$scope.displayFieldList[field.name])
                $scope.displayFieldList[field.name] = field;
            else
                delete $scope.displayFieldList[field.name];
        };

        $scope.reset = function () {
            $scope.queryFieldList = {};
            $scope.groupFieldList = {};
            $scope.groupFieldCount = 0;
            $scope.displayFieldList = {};
        };
        
        $scope.doQuery = function (pageNum) {
            if (pageNum)
                $scope.pageNum = pageNum;
            var params = {
                start: ($scope.pageNum - 1) * $scope.pageSize,
                limit: $scope.pageSize,
                name: $scope.protocolType
            };
            if ($scope.queryFieldList) {
                var i = 0;
                for (var name in $scope.queryFieldList) {
                    var field = $scope.queryFieldList[name];
                    if (!field.opt)
                        continue;
                    params["fields[" + i + "]"] = name;
                    params["opts[" + name + "]"] = field.opt.name;
                    if (typeof field.inputValue1 === "string")
                        params["values[" + name + "][0]"] = field.inputValue1;
                    if (typeof field.inputValue1 === "string" && typeof field.inputValue2 === "string")
                        params["values[" + name + "][1]"] = field.inputValue2;
                    params["types[" + name + "]"] = field.type;
                    i++;
                }
            }
            protocolService.list(params, function (data) {
                if (data) {
                    $scope.recordList = data && data.data ? data.data : [];
                    $scope.recordSize = data && data.count ? data.count : 0;
                    $scope.pageTotal = Math.floor($scope.recordSize / $scope.pageSize) + ($scope.recordSize % $scope.pageSize > 0 ? 1 : 0);
                }
            });
        };

        $scope.doGroup = function (pageNum) {
            if (pageNum)
                $scope.pageNum = pageNum;
            var params = {
                start: ($scope.pageNum - 1) * $scope.pageSize,
                limit: $scope.pageSize,
                name: $scope.protocolType
            };
            if ($scope.queryFieldList) {
                var i = 0;
                for (var name in $scope.queryFieldList) {
                    var field = $scope.queryFieldList[name];
                    if (!field.opt)
                        continue;
                    params["fields[" + i + "]"] = name;
                    params["opts[" + name + "]"] = field.opt.name;
                    if (typeof field.inputValue1 === "string")
                        params["values[" + name + "][0]"] = field.inputValue1;
                    if (typeof field.inputValue1 === "string" && typeof field.inputValue2 === "string")
                        params["values[" + name + "][1]"] = field.inputValue2;
                    params["types[" + name + "]"] = field.type;
                    i++;
                }
            }
            if ($scope.groupFieldList) {
                var arr = [];
                for (var name in $scope.groupFieldList) {
                    arr.push(name);
                }
                params.groupBy = arr.join(",");
            }
            protocolService.group(params, function (data) {
                if (data) {
                    $scope.recordList = data && data.data ? data.data : [];
                    $scope.recordSize = data && data.count ? data.count : 0;
                    $scope.pageTotal = Math.floor($scope.recordSize / $scope.pageSize) + ($scope.recordSize % $scope.pageSize > 0 ? 1 : 0);
                }
            });
        };

        $scope.groupQuery = function (pageNum, groupField) {

        };

        $scope.applyFilter = function () {
            if ($scope.groupFieldCount) {
                $scope.isGroupMode = true;
                $scope.doGroup(1);
            }
            else {
                $scope.groupRecordList = {};
                $scope.isGroupMode = false;
                $scope.doQuery(1);
            }
        };
        
        //执行初始化
        $scope.init();
    });
});