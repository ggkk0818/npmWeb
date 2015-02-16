define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/appView.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('AppViewCtrl', function ($rootScope, $scope, $route, $timeout) {
        $timeout(function () {
            var categories = [], chartData = [], chartData2 = [], now = new Date();
            categories.push(new Date(now.getTime() - 300000 * 6).Format("hh:mm") + "<br />2月11日<br />2015年");
            categories.push(new Date(now.getTime() - 300000 * 5).Format("hh:mm"));
            categories.push(new Date(now.getTime() - 300000 * 4).Format("hh:mm"));
            categories.push(new Date(now.getTime() - 300000 * 3).Format("hh:mm"));
            categories.push(new Date(now.getTime() - 300000 * 2).Format("hh:mm"));
            categories.push(new Date(now.getTime() - 300000 * 1).Format("hh:mm"));
            chartData.push(500);
            chartData.push(400);
            chartData.push(600);
            chartData.push(300);
            chartData.push(400);
            chartData.push(500);
            chartData2.push(0);
            chartData2.push(0);
            chartData2.push(200);
            chartData2.push(300);
            chartData2.push(200);
            chartData2.push(0);
            $("#appView-chartDiv1").trigger("configchange", {
                plotOptions: {
                    series: {
                        color: "#6ac6d0",
                        marker: { enabled: false }
                    }
                }
            }).trigger("chartupdate", [[categories, chartData], ["时间", "交易量"]]);
            $("#appView-chartDiv2").trigger("configchange", {
                plotOptions: {
                    series: {
                        color: "#f77d22",
                        marker: { enabled: false }
                    }
                }
            }).trigger("chartupdate", [[categories, chartData], ["时间", "交易成功率"]]);
            $("#appView-chartDiv3").trigger("configchange", {
                plotOptions: {
                    series: {
                        color: "#f77d22",
                        marker: { enabled: false }
                    }
                }
            }).trigger("chartupdate", [[categories, chartData], ["时间", "响应时间"]]);
            $("#appView-chartDiv4").trigger("configchange", {
                colors: ["#958e4e", "#3d6a95"],
                tooltip: {
                    shared: true
                },
                plotOptions: {
                    column: {
                        stacking: 'percent',
                        borderWidth: 0
                    }
                }
            }).trigger("chartupdate", [[categories, chartData, chartData2], ["时间", "已响应", "未响应"]]);
            var categoryTradeType = ["取现", "退货", "消费", "转账", "存款", "None"];
            $("#appView-chartDiv5").trigger("configchange", {
                plotOptions: {
                    series: {
                        color: "#f77d22",
                        marker: { enabled: false }
                    }
                }
            }).trigger("chartupdate", [[categoryTradeType, chartData.sort(function (a, b) { return b - a; })], ["交易类型", "交易类型"]]);
            var categoryReturnCode = ["200", "304", "404", "403", "500", "Other"];
            $("#appView-chartDiv6").trigger("configchange", {
                plotOptions: {
                    series: {
                        marker: { enabled: false }
                    }
                }
            }).trigger("chartupdate", [[categoryReturnCode, chartData.sort(function (a, b) { return b - a; })], ["返回码", "返回码"]]);
        });
    });
});