define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/appSnap.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('AppSnapCtrl', function ($rootScope, $scope, $route, $timeout, statisticService) {
        $scope.init = function () {
            $scope.query();
        };
        $scope.query = function () {
            statisticService.list({ groupField: "statisticsTime", orderField: "statisticsTime", maxResult: 1 }, function (data) {
                if (data && data.data && data.data.length) {
                    var row = data.data[0];
                    if (typeof row.count !== "undefine")
                        $("#appSnap-countNumber").numberAnimate("set", row.count);
                    if (typeof row.scount !== "undefine" && typeof row.fcount !== "undefine")
                        $("#appSnap-successNumber").numberAnimate("set", Math.round(row.scount * 10000 / row.fcount) / 100);
                    if (typeof row.avgDuration !== "undefine")
                        $("#appSnap-durationNumber").numberAnimate("set", row.avgDuration);
                    //if (typeof row.count !== "undefine")
                    //    $("#appSnap-responsivityNumber").numberAnimate().set(row.count);
                }
            });
            //返回码
            statisticService.list({ groupField: "returnCode", orderField: "count", maxResult: 10 }, function (data) {
                if (data && data.data) {
                    var category = [], countData = [];
                    for (var i = 0; i < data.data.length; i++) {
                        if (i >= 6)
                            break;
                        category.push(data.data[i].group0);
                        countData.push(data.data[i].count || 0);
                    }
                    if (data.data.length > 6) {
                        category[5] = "Other";
                        var otherCount = 0;
                        for (var i = 5; i < data.data.length; i++) {
                            otherCount += data.data[i].count || 0;
                        }
                        countData[5] = otherCount;
                    }
                    $("#appSnap-chartDiv6").trigger("chartupdate", [[category, countData], ["返回码", "返回码"]]);
                }
            });
        };
        //初始化
        $scope.init();
    });
});