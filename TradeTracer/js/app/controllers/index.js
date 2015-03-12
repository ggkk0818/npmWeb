define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/index.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('IndexCtrl', function ($rootScope, $scope, $route, $interval, $location, $timeout, $window, logService, statisticService, warningSocketService) {
        //变量
        $scope.statisticPanel_TYPE = [
            { name: "交易量", container: "index-chartDiv1" },
            { name: "渠道", container: "index-chartDiv2" },
            { name: "返回码", container: "index-chartDiv3" }
        ];
        $scope.dataPanel_MAX_SIZE = 50;
        $scope.statisticPanel_current = null;
        $scope.dataPanel_logList = null;
        $scope.dataPanel_newLogCount = 0;
        $scope.warnPanel_warnList = [];
        //初始化
        $scope.init = function () {
            //数据表格
            $scope.dataPanel_query();
            //统计图
            $timeout(function () {
                $("#index-chartDiv1").trigger("configchange", [{
                    plotOptions: {
                        series: {
                            color: "#f77d22",
                            marker: { enabled: false }
                        }
                    },
                    legend: {
                        enabled: false
                    }
                }]);
                //交易量
                statisticService.list({ groupField: "statisticsTime", orderField: "statisticsTime", start: 0, limit: 10 }, function (data) {
                    if (data && data.data) {
                        var category = [], chartData = [];
                        for (var i = 0; i < data.data.length; i++) {
                            if (i >= 6)
                                break;
                            var time = new Date(data.data[i].group0),
                                timeStr = time.Format("hh:mm");
                            if (i + 1 == data.data.length)
                                timeStr += "<br />" + time.Format("M月d日") + "<br />" + time.Format("yyyy年");
                            category.push(timeStr);
                            chartData.push(data.data[i].count);
                        }
                        $("#index-chartDiv1").trigger("chartupdate", [[category.reverse(), chartData.reverse()], ["时间", "交易量"]]);
                    }
                });
                //返回码
                statisticService.list({ groupField: "returnCode", orderField: "count", start: 0, limit: 10 }, function (data) {
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
                        $("#index-chartDiv3").trigger("chartupdate", [[category, countData], ["返回码", "返回码"]]);
                    }
                });
            });
            //告警
            if (!warningSocketService.isOpen())
                warningSocketService.open();
            warningSocketService.on("onmessage.indexWarnPanel", function (e) {
                if (e && e.data) {
                    var data = null;
                    try {
                        data = JSON.parse(e.data);
                    }
                    catch (err) { }
                    if (data && data.length) {
                        for (var i = 0; i < data.length; i++) {
                            var warn = data[i],
                                exists = false;
                            for (var j = 0; j < $scope.warnPanel_warnList.length; j++) {
                                if (warn.type === $scope.warnPanel_warnList[j].type) {
                                    if (warn.count)
                                        $scope.warnPanel_warnList[j].count = warn.count;
                                    else
                                        $scope.warnPanel_warnList.slice(j, 1);
                                    exists = true;
                                    break;
                                }
                            }
                            if (!exists && warn.count)
                                $scope.warnPanel_warnList.push(warn);
                        }
                    }
                }
            });
            warningSocketService.query();
        };
        //查询实时数据
        var dataPanelQueryTimer = null;
        $scope.dataPanel_query = function () {
            logService.list({ from: 0, size: 20 }, function (data) {
                if (data && data.data) {
                    $scope.dataPanel_newLogCount = data.data.length || 0;
                    if ($scope.dataPanel_logList && $scope.dataPanel_logList.length) {
                        var lastId = $scope.dataPanel_logList[0]._id,
                            newLogCount = null;
                        for (var i = 0; i < (data.data.length || 0); i++) {
                            if (data.data[i]._id === lastId) {
                                newLogCount = i;
                                break;
                            }
                        }
                        if (typeof newLogCount === "number")
                            $scope.dataPanel_newLogCount = newLogCount;
                    }
                    if ($scope.dataPanel_logList && $scope.dataPanel_newLogCount > 0) {
                        for(var i = 0; i < $scope.dataPanel_newLogCount; i++){
                            $scope.dataPanel_logList.splice(i, 0, data.data[i]);
                        }
                        if ($scope.dataPanel_logList.length > $scope.dataPanel_MAX_SIZE) {
                            var c = $scope.dataPanel_logList.length - $scope.dataPanel_MAX_SIZE;
                            $scope.dataPanel_logList.splice(-c, c);
                        }
                        $scope.dataPanel_showNewLog();
                    } else {
                        $scope.dataPanel_logList = data.data;
                    }
                }
                dataPanelQueryTimer = $timeout($scope.dataPanel_query, 5000);
            });
        };
        //告警点击跳转
        $scope.warnPanel_query = function (warn) {
            $location.path("/warning").search({ logType: warn.type });
        };
        //数据表格滚动效果
        $scope.dataPanel_showNewLog = function () {
            $timeout(function () {
                var $dataTable = $("#dataPanelTable");
                if ($dataTable.length) {
                    if ($dataTable.find("tr").length == $scope.dataPanel_logList.length) {
                        if ($dataTable.find("table").outerHeight() > $dataTable.height()) {
                            var lineHeight = $dataTable.find("tr").first().outerHeight();
                            $dataTable.animate({ scrollTop: lineHeight * $scope.dataPanel_newLogCount }, 0).animate({ scrollTop: 0 }, "slow", "easeInOutQuad");
                        }
                    }
                    else {
                        $scope.dataPanel_showNewLog();
                    }
                }
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
            $timeout.cancel(dataPanelQueryTimer);
            $timeout.cancel(windowResizeChartTimer);
            $timeout.cancel(statisticPanelTimer);
            $timeout.cancel(statisticPanelLoadingTimer);
            warningSocketService.off("onmessage.indexWarnPanel");
        });
        //执行初始化
        $scope.init();
    });
});