define(['angular', 'lodash', 'jquery', 'services/all'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('PieChartController', function ($rootScope, $scope, $window, $timeout) {
        $scope.chart = null;
        $scope.chartData = null;
        $scope.chartFields = null;
        //默认图表配置
        $scope.chartConfig = {
            chart: {
                type: 'pie',
                height: 200
            },
            legend: {
                enabled: true,
                align: 'right',
                verticalAlign: 'middle',
                layout: 'vertical'
            },
            tooltip: {},
            xAxis: {
                title: { text: null }
            },
            yAxis: {
                title: { text: null }
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true
                }
            },
            title: { text: '' },
            credits: { enabled: false },
            series: []
        };
        //初始化图表
        $scope.init = function () {
            var ctn = getChartContainer();
            if (ctn.length) {
                $scope.chart = getChartContainer().highcharts($scope.chartConfig).highcharts();
                if ($scope.chartData)
                    $scope.update($scope.chartData, $scope.chartFields);
            }
            else {
                //等待html编译完成后初始化
                $timeout(function () {
                    $scope.init();
                }, 100);
            }
        };
        //更新图表数据
        $scope.update = function (data, fields) {
            $scope.chartData = data ? data : [];
            if (fields)
                $scope.chartFields = fields;
            if ($scope.chart) {
                for (var i = 1; i < data.length; i++) {
                    //转换为数字
                    for (var j = 0; j < data[i].length; j++) {
                        if (typeof data[i][j] === "string") {
                            try{
                                data[i][j] = parseFloat(data[i][j]);
                                if ($scope.chartConfig.yAxis.scale == "linear") {

                                }
                            }catch(e){}
                        }
                    }
                    var seriesData = _.clone(data[i]);
                    for (var j = 0; j < seriesData.length; j++) {
                        var val = seriesData[j];
                        if ($scope.chartConfig.yAxis.scale && $scope.chartConfig.yAxis.scale == "log" && _.isNumber(val)) {
                            val = Math.round(Math.log(val) * 100) / 100;
                        }
                        seriesData[j] = [data[0].length > j ? data[0][j] : "未知", val];
                    }
                    if (i - 1 >= $scope.chart.series.length) {
                        $scope.chart.addSeries({ data: seriesData, name: fields ? fields[i] : ("图" + i) });
                    }
                    else {
                        $scope.chart.series[i - 1].update({ data: seriesData, name: fields ? fields[i] : ("图" + i) });
                    }
                }
                //删除多余的series
                if (data.length - 1 > $scope.chart.series.length) {
                    for (var i = $scope.chart.series.length - 1; i >= data.length - 1; i--) {
                        $scope.chart.series[i].remove();
                    }
                }
            }
        };
        //更新配置
        $scope.updateConfig = function (config) {
            if (config) {
                if (config.chart) {
                    _.assign($scope.chartConfig.chart, config.chart);
                }
                if (config.xAxis) {
                    _.assign($scope.chartConfig.xAxis, config.xAxis);
                }
                if (config.yAxis) {
                    _.assign($scope.chartConfig.yAxis, config.yAxis);
                }
                if (config.legend) {
                    _.assign($scope.chartConfig.legend, config.legend);
                }
                if (config.plotOptions) {
                    _.assign($scope.chartConfig.plotOptions, config.plotOptions);
                }
                if (config.colors) {
                    $scope.chartConfig.colors = config.colors;
                }
                if (config.tooltip) {
                    _.assign($scope.chartConfig.tooltip, config.tooltip);
                }
                $scope.init();
                $scope.$emit("chartConfigUpdated", $scope.chartConfig, $scope);
            }
        };
        //刷新图表
        $scope.reflow = function () {
            if ($scope.chart)
                $scope.chart.reflow();
        };
        //获取图表容器
        var getChartContainer = function () {
            return $("#lineChart-" + $scope.$id);
        };
        //初始化图表
        $scope.init();
    });
});