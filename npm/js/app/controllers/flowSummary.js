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
                $scope.chartFlow = echarts.init($("#flowChart").get(0), "blue");
                $scope.chartFlow.setOption(option_flow);
                $scope.chartIp = echarts.init($("#ipChart").get(0), "blue");
                $scope.chartIp.setOption(option_ip);
                $scope.chartProtocol = echarts.init($("#protocolChart").get(0), "blue");
                $scope.chartProtocol.setOption(option_protocol);
            });
            //$scope.doQuery();
            $scope.queryTimer = $interval($scope.doQuery, 1000);
        };

        $scope.doQuery = function () {
            flowService.ipFlowChart({ start: 0, limit: 180 }, function (data) {
                if (data && data.data) {
                    var chartData = [];
                    for (var i = 0; i < data.data.length; i++) {
                        var d = data.data[i];
                        chartData.push({ value: [d.time, Math.round(d.totalflow / 1024 / 1024) || 0] });
                    }
                    option_flow.series[0].data = chartData;
                    if ($scope.chartFlow)
                        $scope.chartFlow.dispose();
                    $scope.chartFlow = echarts.init($("#flowChart").get(0), "blue");
                    $scope.chartFlow.setOption(option_flow, true);
                }
                else {
                    option_flow.series[0].data = [];
                }
            });
            flowService.ipChart({ start: 0, limit: 10 }, function (data) {
                if (data && data.data) {
                    var axisData = [],
                        chartData1 = [],
                        chartData2 = [];
                    data.data = data.data.reverse();
                    for (var i = 0; i < data.data.length; i++) {
                        var d = data.data[i];
                        axisData.push(d.srcip);
                        chartData1.push({ name: d.srcip, value: d.sendFlow || 0 });
                        chartData2.push({ name: d.srcip, value: d.recFlow || 0 });
                    }
                    option_ip.yAxis[0].data = axisData;
                    option_ip.series[0].data = chartData1;
                    option_ip.series[1].data = chartData2;
                    if ($scope.chartIp)
                        $scope.chartIp.dispose();
                    $scope.chartIp = echarts.init($("#ipChart").get(0), "blue");
                    $scope.chartIp.setOption(option_ip, true);
                }
                else {
                    option_ip.yAxis[0].data = [];
                    option_ip.series[0].data = [];
                    option_ip.series[1].data = [];
                }
            });
            flowService.protocolChart({ start: 0, limit: 10 }, function (data) {
                if (data && data.data) {
                    var axisData = [],
                        chartData1 = [],
                        chartData2 = [];
                    data.data = data.data.reverse();
                    for (var i = 0; i < data.data.length; i++) {
                        var d = data.data[i];
                        axisData.push(d.protocol);
                        chartData1.push({ name: d.protocol, value: d.sendFlow || 0 });
                        chartData2.push({ name: d.protocol, value: d.recFlow || 0 });
                    }
                    option_protocol.yAxis[0].data = axisData;
                    option_protocol.series[0].data = chartData1;
                    option_protocol.series[1].data = chartData2;
                    if ($scope.chartProtocol)
                        $scope.chartProtocol.dispose();
                    $scope.chartProtocol = echarts.init($("#protocolChart").get(0), "blue");
                    $scope.chartProtocol.setOption(option_protocol, true);
                }
                else {
                    option_protocol.yAxis[0].data = [];
                    option_protocol.series[0].data = [];
                    option_protocol.series[1].data = [];
                }
            });
        };
        // 折线图
        var option_flow = {
            animation: false,
            title: {
                text: '总流量(MB)'
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
                    mark: { show: true },
                    dataView: { show: true, readOnly: false },
                    restore: { show: true },
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
                itemStyle: { normal: { areaStyle: { type: 'default' } } },
                data: []
            }]
        };
        //IP TOP10
        var option_ip = {
            animation: false,
            title: {
                text: 'IP TOP10'
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
                    mark: { show: true },
                    dataView: { show: true, readOnly: false },
                    magicType: { show: true, type: ['line', 'bar'] },
                    restore: { show: true },
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
                text: '协议 TOP10'
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
                    mark: { show: true },
                    dataView: { show: true, readOnly: false },
                    magicType: { show: true, type: ['line', 'bar'] },
                    restore: { show: true },
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