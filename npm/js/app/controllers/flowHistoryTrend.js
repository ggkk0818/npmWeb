define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/flowHistoryTrend.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('FlowHistoryTrendCtrl', function ($rootScope, $scope, $route, $timeout, $interval, $location, dateTimeService, flowService) {
        //初始化变量
        $scope.startDate = null;
        $scope.queryTimer = null;
        $scope.chartFlow = null;
        $scope.recordList = null;
        $scope.chartData = null;
        $scope.chartDataLevel = 10;
        $scope.chartDataZoomingLevel = 10;
        //表单数据
        $scope.startDateInput = $scope.startDate = dateTimeService.serverTime.Format("yyyy-MM-dd");
        $scope.init = function () {
            $timeout(function () {
                $scope.chartFlow = echarts.init($("#flowChart").get(0), "blue").showLoading({ effect: "dynamicLine" }).on(echarts.config.EVENT.DATA_ZOOM, onChartZoom);
            });
            $scope.setSearchParams();
            $scope.doQuery();
            if ($scope.startDate == dateTimeService.serverTime.Format("yyyy-MM-dd")) {
                $scope.queryTimer = $interval($scope.doQuery, 3600 * 1000);
            }
        };
        //获取查询参数
        $scope.getSearchParams = function () {
            var params = {};
            if ($scope.startDate)
                params.startTime = $scope.startDate;
            return params;
        };
        //从url获取查询参数设置变量
        $scope.setSearchParams = function () {
            var params = $location.search();
            if (!params)
                return;
            if (params.startTime) {
                $scope.startDate = params.startTime;
                $scope.startDateInput = params.startTime;
            }
        };
        //显示信息
        $scope.show = function () {
            var params = $scope.getSearchParams();
            if (_.isEqual(params, $location.search()))
                params.refresh = true;
            $location.search(params);
        };

        $scope.doQuery = function () {
            var params = { start: 0, limit: 86400 };
            if ($scope.startDate) {
                params.startTime = $scope.startDate + " 00:00:00";
                params.endTime = $scope.startDate + " 23:59:59";
            }
            flowService.timeFlow(params, function (data) {
                if (data && data.data) {
                    $scope.recordList = data.data;
                    //if ($scope.recordList && $scope.recordList.length) {
                    //    var max = 0;
                    //    for (var i = 0; i < $scope.recordList.length; i++) {
                    //        var record = $scope.recordList[i], totalflow = record.totalflow * 8 / 1024;
                    //        if (totalflow > max)
                    //            max = totalflow;
                    //    }
                    //    option_flow.yAxis.min = 0;
                    //    option_flow.yAxis.max = max * 1.1;
                    //    option_flow.yAxis.scale = false;
                    //}
                    //else {
                    //    if (typeof option_flow.yAxis.min === "number")
                    //        delete option_flow.yAxis.min;
                    //    if (typeof option_flow.yAxis.max === "number")
                    //        delete option_flow.yAxis.max;
                    //    option_flow.yAxis.scale = true;
                    //}
                    calcChartData($scope.recordList);
                    option_flow.series[0].data = $scope.chartData[$scope.chartDataLevel];
                }
                $scope.chartFlow.hideLoading().setOption(option_flow, true);
            });
        };
        var calcChartData = function (recordList) {
            var ctnWidth = $("#flowChart").width();
            console.info("calc chart data " + ctnWidth);
            $scope.chartData = {};
            for (var zoomSize = 5; zoomSize <= 100; zoomSize += 5) {
                var dataCount = Math.ceil(ctnWidth * 100 / zoomSize),
                    step = Math.floor(($scope.recordList ? $scope.recordList.length : 0) / dataCount),
                    chartData = [];
                for (var i = 0; i < $scope.recordList.length; i += step) {
                    var time = $scope.recordList[i].time, value = $scope.recordList[i].totalflow || 0;
                    for (var j = 1; j <= step; j++) {
                        if (i + j < $scope.recordList.length)
                            value += $scope.recordList[i + j].totalflow || 0;
                    }
                    chartData.push({ value: [time, (value / step * 8 / 1024).toFixed(1)] });
                }
                $scope.chartData[zoomSize] = chartData;
            }
        };
        var optimizeChart = function (size) {
            console.info("optimize chart");
            if (typeof size === "undefined") {
                size = $scope.chartDataLevel;
            }
            for (var zoomSize in $scope.chartData) {
                zoomSize = parseInt(zoomSize);
                if (zoomSize >= size) {
                    option_flow.series[0].data = $scope.chartData[zoomSize];
                    $scope.chartFlow.setSeries(option_flow.series, true);
                    $scope.chartDataLevel = zoomSize;
                    break;
                }
            }
        };
        //搜索
        $scope.search = function () {
            if (typeof $scope.startDateInput == "undefined" || $scope.startDateInput == null || $scope.startDateInput.length == 0)
                $scope.startDate = null;
            else
                $scope.startDate = $scope.startDateInput;
            $scope.show();
        };
        //表单输入框按键事件
        $scope.formKeypressHandler = function (e) {
            if (e.keyCode == 13) {
                $scope.search();
            }
        };
        //前一天
        $scope.addDay = function (num) {
            var date = new Date($scope.startDate.replace(/-/g, "/"));
            date.setDate(date.getDate() + num);
            $scope.startDateInput = $scope.startDate = date.Format("yyyy-MM-dd");
            $scope.show();
        };

        // 折线图
        var option_flow = {
            animation: false,
            title: {
                text: '总流量（kbps）'
            },
            tooltip: {
                trigger: 'axis',
                formatter: function (params) {
                    var date = new Date(params.value[0]).Format("yyyy-MM-dd hh:mm:ss");
                    return params.seriesName
                        + params.value[1] + '(' +
                        date
                        + ')<br/>'
                }
            },
            legend: {
                data: ['总流量']
            },
            toolbox: {
                show: true,
                feature: {
                    mark: { show: false },
                    dataView: { show: false, readOnly: false },
                    restore: { show: false },
                    saveAsImage: { show: true }
                }
            },
            calculable: true,
            dataZoom: {
                show: true,
                y: 360,
                realtime: true,
                start: 45,
                end: 55
            },
            grid: {
                y2: 80
            },
            xAxis: [
                {
                    type: 'time'
                }
            ],
            yAxis: [{
                type: 'value',
                min: 0
            }],
            series: [{
                name: '总流量',
                type: 'line',
                smooth: true,
                symbol: 'none',
                itemStyle: { normal: { areaStyle: { type: 'default' } } },
                data: []
            }]
        };
        //图表缩放
        var onChartZoom = function (e) {
            var zoom = e.zoom,
                size = Math.round(zoom.end - zoom.start);
            for (var i = 0; i < 4; i++) {
                if ((size + i) % 5 == 0) {
                    size = size + i;
                    break;
                }
                else if ((size - i) % 5 == 0) {
                    size = size - i;
                    break;
                }
            }
            if (size != $scope.chartDataLevel || size != $scope.chartDataZoomingLevel) {
                console.info("set chart level " + size);
                $scope.chartDataZoomingLevel = size;
                if ($scope.chartDataLevel < 40 && $scope.chartDataZoomingLevel - $scope.chartDataLevel > 10) {
                    optimizeChart($scope.chartDataZoomingLevel);
                }
            }
        };
        var onMouseUp = function () {
            $scope.$apply(function () {
                if ($scope.chartDataZoomingLevel != $scope.chartDataLevel) {
                    optimizeChart($scope.chartDataZoomingLevel);
                }
            });
        };
        var windowResize = function () {
            $scope.chartFlow.resize();
            $scope.$apply(function () {
                $timeout(function () {
                    calcChartData($scope.recordList);
                    optimizeChart();
                });
            });
        };
        $scope.init();
        //鼠标按键事件
        $("#flowChart").on("mouseup.flowHistoryTrend", onMouseUp);
        //改变窗口大小事件
        $(window).on("resize.flowHistoryTrend", windowResize);
        //离开该页事件
        $scope.$on("$routeChangeStart", function () {
            $("#flowChart").off("mouseup.flowHistoryTrend");
            $(window).off("resize.flowHistoryTrend");
            if ($scope.queryTimer)
                $interval.cancel($scope.queryTimer);
        });

    });
});
