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
                        field.show = true;
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
            $scope.displayFieldList[field.name].show = !$scope.displayFieldList[field.name].show;
        };
        
        //执行初始化
        $scope.init();
    });
});