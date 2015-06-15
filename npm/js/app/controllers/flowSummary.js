define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/statisticSearch.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('FlowSummaryCtrl', function ($rootScope, $scope, $route, $timeout, $interval, $location, flowService) {
        //初始化变量
        $scope.queryTimer = null;
        $scope.chartFlow = null;
        $scope.chartIp = null;
        $scope.chartProtocol = null;
        $scope.init = function () {
            $timeout(function () {
                $scope.chartFlow = echarts.init($("#flowChart").get(0), "blue");//.showLoading({ effect: "bubble" });
                $scope.chartFlow.setOption(option_flow);
                $scope.chartPackage = echarts.init($("#packageChart").get(0), "blue");
                $scope.chartPackage.setOption(option_package);
                $scope.chartIp = echarts.init($("#ipChart").get(0), "blue");
                $scope.chartIp.setOption(option_ip);
                $scope.chartProtocol = echarts.init($("#protocolChart").get(0), "blue");
                $scope.chartProtocol.setOption(option_protocol);
            });
            //$scope.doQuery();
            $scope.queryTimer = $interval($scope.doQuery, 3000);
        };

        $scope.doQuery = function () {
            flowService.timeFlow(null, function (data) {
                if (data && data.data) {
                    var flowData = [],
                        packageData = [];
                    if (data.data.length) {
                        for (var i = 0; i < data.data.length; i++) {
                            var d = data.data[i];
                            flowData.push({ value: [d.time, d.totalflow ? (d.totalflow * 8 / 1024).toFixed(1) : 0] });
                            packageData.push({ value: [d.time, (d.sendPackage || 0) + (d.recPackage || 0)] });
                        }
                    }
                    else if (!option_flow.series[0].data.length && !option_package.series[0].data.length) {
                        return;
                    }
                    option_flow.series[0].data = flowData;
                    option_package.series[0].data = packageData;
                    if ($scope.chartFlow)
                        $scope.chartFlow.dispose();
                    $scope.chartFlow = echarts.init($("#flowChart").get(0), "blue");
                    $scope.chartFlow.setOption(option_flow, true);
                    if ($scope.chartPackage)
                        $scope.chartPackage.dispose();
                    $scope.chartPackage = echarts.init($("#packageChart").get(0), "blue");
                    $scope.chartPackage.setOption(option_package, true);
                }
            });
            flowService.ipChart(null, function (data) {
                if (data && data.data) {
                    var axisData = [],
                        chartData1 = [],
                        chartData2 = [];
                    if (data.data.length) {
                        data.data = data.data.reverse();
                        for (var i = 0; i < data.data.length; i++) {
                            var d = data.data[i];
                            axisData.push(d.srcip);
                            chartData1.push({ name: d.srcip, value: d.sendFlow ? (d.sendFlow * 8 / 1024).toFixed(1) : 0 });
                            chartData2.push({ name: d.srcip, value: d.recFlow ? (d.recFlow * 8 / 1024).toFixed(1) : 0 });
                        }
                    }
                    else if (!option_ip.series[0].data.length) {
                        return;
                    }
                    option_ip.yAxis[0].data = axisData;
                    option_ip.series[0].data = chartData1;
                    option_ip.series[1].data = chartData2;
                    if ($scope.chartIp)
                        $scope.chartIp.dispose();
                    $scope.chartIp = echarts.init($("#ipChart").get(0), "blue");
                    $scope.chartIp.setOption(option_ip, true);
                }
            });
            flowService.protocolChart(null, function (data) {
                if (data && data.data) {
                    var axisData = [],
                        chartData1 = [],
                        chartData2 = [];
                    if (data.data.length) {
                        data.data = data.data.reverse();
                        for (var i = 0; i < data.data.length; i++) {
                            var d = data.data[i];
                            axisData.push(d.protocol);
                            chartData1.push({ name: d.protocol, value: d.sendFlow ? (d.sendFlow * 8 / 1024).toFixed(1) : 0 });
                            chartData2.push({ name: d.protocol, value: d.recFlow ? (d.recFlow * 8 / 1024).toFixed(1) : 0 });
                        }
                    }
                    else if (!option_protocol.series[0].data.length) {
                        return;
                    }
                    option_protocol.yAxis[0].data = axisData;
                    option_protocol.series[0].data = chartData1;
                    option_protocol.series[1].data = chartData2;
                    if ($scope.chartProtocol)
                        $scope.chartProtocol.dispose();
                    $scope.chartProtocol = echarts.init($("#protocolChart").get(0), "blue");
                    $scope.chartProtocol.setOption(option_protocol, true);
                }
            });
        };
        // 折线图
        var option_flow = {
            animation: false,
            title: {
                text: '总流量（kb）'
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
            xAxis: [
                {
                    type: 'time'
                }
            ],
            yAxis: [{
                type: 'value'
            }, {
                type: 'value'
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
        // 数据包折线图
        var option_package = {
            animation: false,
            title: {
                text: '数据包（pps）'
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
                data: ['数据包']
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
            xAxis: [
                {
                    type: 'time'
                }
            ],
            yAxis: [{
                type: 'value'
            }, {
                type: 'value'
            }],
            series: [{
                name: '数据包',
                type: 'line',
                smooth: true,
                symbol: 'none',
                itemStyle: { normal: { areaStyle: { type: 'default' } } },
                data: []
            }]
        };
        //IP TOP10
        var option_ip = {
            animation: false,
            title: {
                text: 'IP top 10',
                subtext: '近10分钟流量之和（kb）'
            },
            tooltip: {
                trigger: 'axis'
            },
            grid: {x:120},
            legend: {
                data: ['发送', '接收']
            },
            toolbox: {
                show: true,
                feature: {
                    mark: { show: false },
                    dataView: { show: false, readOnly: false },
                    magicType: { show: false, type: ['line', 'bar'] },
                    restore: { show: false },
                    saveAsImage: { show: true }
                }
            },
            calculable: true,
            xAxis: [
                {
                    type: 'value'
                }
            ],
            yAxis: [
                {
                    type: 'category',
                    data: []
                }
            ],
            series: [{
                name: '发送',
                type: 'bar',
                stack: '总量',
                itemStyle: { normal: { label: { show: false, position: 'insideRight' } } },
                data: []
            }, {
                name: '接收',
                type: 'bar',
                stack: '总量',
                itemStyle: { normal: { label: { show: false, position: 'insideRight' } } },
                data: []
            }]
        };
        //IP TOP10
        var option_protocol = {
            animation: false,
            title: {
                text: '协议 top 10',
                subtext: '近10分钟流量之和（kb）'
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['发送', '接收']
            },
            toolbox: {
                show: true,
                feature: {
                    mark: { show: false },
                    dataView: { show: false, readOnly: false },
                    magicType: { show: false, type: ['line', 'bar'] },
                    restore: { show: false },
                    saveAsImage: { show: true }
                }
            },
            calculable: true,
            xAxis: [
                {
                    type: 'value'
                }
            ],
            yAxis: [
                {
                    type: 'category',
                    data: []
                }
            ],
            series: [{
                name: '发送',
                type: 'bar',
                stack: '总量',
                itemStyle: { normal: { label: { show: false, position: 'insideRight' } } },
                data: []
            }, {
                name: '接收',
                type: 'bar',
                stack: '总量',
                itemStyle: { normal: { label: { show: false, position: 'insideRight' } } },
                data: []
            }]
        };
        $scope.init();
        //离开该页事件
        $scope.$on("$routeChangeStart", function () {
            if ($scope.queryTimer)
                $interval.cancel($scope.queryTimer);
        });

    });
});
