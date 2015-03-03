define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/appView.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('AppViewCtrl', function ($rootScope, $scope, $route, $timeout, statisticService) {
        $scope.init = function () {
            $timeout(function () {
                $("#appView-chartDiv1").trigger("configchange", {
                    plotOptions: {
                        series: {
                            color: "#6ac6d0",
                            marker: { enabled: false }
                        }
                    }
                });
                $("#appView-chartDiv2").trigger("configchange", {
                    plotOptions: {
                        series: {
                            color: "#f77d22",
                            marker: { enabled: false }
                        }
                    }
                });
                $("#appView-chartDiv3").trigger("configchange", {
                    plotOptions: {
                        series: {
                            color: "#f77d22",
                            marker: { enabled: false }
                        }
                    }
                });
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
                });
                $("#appView-chartDiv5").trigger("configchange", {
                    plotOptions: {
                        series: {
                            color: "#f77d22",
                            marker: { enabled: false }
                        }
                    }
                });
                $("#appView-chartDiv6").trigger("configchange", {
                    plotOptions: {
                        series: {
                            marker: { enabled: false }
                        }
                    }
                });
            });
            $scope.query();
            $timeout(function () {
            }, 2000);
        };
        //查询图表数据
        $scope.query = function () {
            //前四个
            statisticService.show({ groupField: "statisticsTime", orderField: "statisticsTime", maxResult: 6 }, function (data) {
                if (data && data.data) {
                    var category = [], countData = [],
                        successData = [], durationData = [],
                        responsivityData = [];
                    for (var i = 0; i < data.data.length; i++) {
                        if (i >= 10)
                            break;
                        var time = new Date(data.data[i].group0),
                            timeStr = time.Format("hh:mm");
                        if (i + 1 == data.data.length)
                            timeStr += "<br />" + time.Format("M月d日") + "<br />" + time.Format("yyyy年");
                        category.push(timeStr);
                        countData.push(data.data[i].count || 0);//交易量
                        successData.push(Math.round(data.data[i].scount * 100 / data.data[i].fcount) || 0);//成功率
                        durationData.push(data.data[i].avgDuration || 0);//响应时间
                        responsivityData.push(0);//响应率
                    }
                    category.reverse();
                    countData.reverse();
                    successData.reverse();
                    durationData.reverse();
                    responsivityData.reverse();
                    $("#appView-chartDiv1").trigger("chartupdate", [[category, countData], ["时间", "交易量"]]);
                    $("#appView-chartDiv2").trigger("chartupdate", [[category, successData], ["时间", "交易成功率"]]);
                    $("#appView-chartDiv3").trigger("chartupdate", [[category, durationData], ["时间", "响应时间"]]);
                    //$("#appView-chartDiv4").trigger("chartupdate", [[category, responsivityData, responsivityData], ["时间", "已响应", "未响应"]]);
                }
            });
            //返回码
            statisticService.show({ groupField: "returnCode", orderField: "count", maxResult: 10 }, function (data) {
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
                    $("#appView-chartDiv6").trigger("chartupdate", [[category, countData], ["返回码", "返回码"]]);
                }
            });
        };
        //执行初始化
        $scope.init();
    });
});