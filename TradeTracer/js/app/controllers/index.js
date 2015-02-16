define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/index.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('IndexCtrl', function ($rootScope, $scope, $route, $interval, $location, $timeout, $window) {
        $scope.statisticPanel_TYPE = [
            { name: "类型", container: "index-chartDiv1" },
            { name: "渠道", container: "2" },
            { name: "返回码", container: "3" }
        ];
        $scope.statisticPanel_current = null;
        //初始化
        $scope.init = function () {
            $timeout(function () {
                var chartData = [];
                chartData.push(500);
                chartData.push(400);
                chartData.push(600);
                chartData.push(300);
                chartData.push(400);
                chartData.push(500);
                var categoryTradeType = ["取现", "退货", "消费", "转账", "存款", "None"];
                $("#index-chartDiv1").trigger("configchange", [{
                    plotOptions: {
                        series: {
                            color: "#f77d22",
                            marker: { enabled: false }
                        }
                    }
                }]).trigger("chartupdate", [[categoryTradeType, chartData.sort(function (a, b) { return b - a; })], ["交易类型", "交易类型"]]);
            });
        };
        //统计Panel标签点击
        $scope.changeStatisticType = function (t) {
            $scope.statisticPanel_current = t;
            //距离上次展示长宽有变，刷新图表
            if ($scope.statisticPanel_current.isDirty) {
                $timeout(function () {
                    reloadChart($scope.statisticPanel_current);
                }, 1000);
            }
        };
        //图表重新初始化
        var reloadChart = function (t) {
            if (t && t.isDirty) {
                $("#" + t.container).trigger("configchange", [{
                    chart: {
                        height: $("#statisticPanel .panel-body").height()
                    }
                }]);
                t.isDirty = false;
            }
        };
        //窗口调整时更新各Panel高度
        var windowResizeChartTimer = null;
        var windowResize = function () {
            var $dataPanel = $("#dataPanel"),
                $warnPanel = $("#warnPanel"),
                $statisticPanel = $("#statisticPanel"),
                offsetTop = $dataPanel.parent().offset().top,
                margin = 20;
            $dataPanel.outerHeight($($window).height() - offsetTop - margin);
            $warnPanel.outerHeight(($($window).height() - offsetTop - margin * 2) / 2);
            $statisticPanel.outerHeight(($($window).height() - offsetTop - margin * 2) / 2);
            //计算内容div高度
            var $dataPanelTable = $("#dataPanelTable"),
                $warnPanelBody = $("#warnPanelBody");
            $dataPanelTable.height($dataPanel.height() - ($dataPanelTable.offset().top - offsetTop));
            $warnPanelBody.outerHeight($warnPanel.height() - ($warnPanelBody.offset().top - offsetTop));
            //调整统计图表高度
            $("#statisticPanel .panel-body").outerHeight($warnPanel.height() - ($warnPanelBody.offset().top - offsetTop));
            for (var i in $scope.statisticPanel_TYPE) {
                $scope.statisticPanel_TYPE[i].isDirty = true;
            }
            $timeout.cancel(windowResizeChartTimer);
            windowResizeChartTimer = $timeout(function () {
                reloadChart($scope.statisticPanel_current);
            }, 500);
        };
        $($window).off("resize.index").on("resize.index", windowResize).trigger("resize.index");
        //统计Panel自动切换
        var remoteSolid = function () {
            $("#statisticPanel .panel-heading .nav").find("li > a > .solid").remove();
        };
        var addSolid = function () {
            $("#statisticPanel .panel-heading .nav > li > a").each(function (i, el) {
                if ($(el).text() === $scope.statisticPanel_current.name) {
                    $(el).append("<div class=\"solid\"></div>");
                    $timeout.cancel(statisticPanelLoadingTimer);
                    statisticPanelLoadingTimer = $timeout(function () {
                        if ($(el).children(".solid").length) {
                            $(el).children(".solid").css("width", "100%");
                            statisticPanelTimer = $timeout(statisticPanelSwitch, 5000);
                        }
                    }, 1000);
                    return false;
                }
            });
        };
        var statisticPanelSwitch = function () {
            var i = $scope.statisticPanel_current ? $scope.statisticPanel_TYPE.indexOf($scope.statisticPanel_current) : $scope.statisticPanel_TYPE.length;
            if (i + 1 >= $scope.statisticPanel_TYPE.length)
                $scope.changeStatisticType($scope.statisticPanel_TYPE[0]);
            else
                $scope.changeStatisticType($scope.statisticPanel_TYPE[i + 1]);
            remoteSolid();
            addSolid();
        };
        var statisticPanelTimer = null;
        var statisticPanelLoadingTimer = null;
        $timeout(function () {
            $("#statisticPanel").mouseenter(function () {
                $scope.$apply(function () {
                    remoteSolid();
                    if (statisticPanelTimer) {
                        $timeout.cancel(statisticPanelTimer);
                        statisticPanelTimer = null;
                    }
                });
            }).mouseleave(function () {
                $scope.$apply(function () {
                    if (statisticPanelTimer) {
                        $timeout.cancel(statisticPanelTimer);
                    }
                    remoteSolid();
                    addSolid();
                });
            });
            statisticPanelSwitch();
        });
        //离开该页事件
        $scope.$on("$routeChangeStart", function () {
            $($window).off("resize.index");
            $timeout.cancel(statisticPanelTimer);
        });
        //执行初始化
        $scope.init();
    });
});