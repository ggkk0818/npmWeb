define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/appSnap.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('AppSnapCtrl', function ($rootScope, $scope, $route, $timeout) {
        $timeout(function () {
            var categories = [], chartData = [], chartData2 = [], now = new Date();
            chartData.push(500);
            chartData.push(400);
            chartData.push(600);
            chartData.push(300);
            chartData.push(400);
            chartData.push(500);
            var categoryReturnCode = ["200", "304", "404", "403", "500", "Other"];
            $("#appSnap-chartDiv6").trigger("configchange", {
                plotOptions: {
                    series: {
                        marker: { enabled: false }
                    }
                }
            }).trigger("chartupdate", [[categoryReturnCode, chartData.sort(function (a, b) { return b - a; })], ["返回码", "返回码"]]);
        });
    });
});