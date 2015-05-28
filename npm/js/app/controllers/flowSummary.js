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
            $scope.queryTimer = $interval($scope.doQuery, 1000);
        };

        $scope.doQuery = function () {
            var params = {
                type: $scope.logType.id,
                start: ($scope.pageNum - 1) * $scope.pageSize,
                limit: $scope.pageSize
            };
            statisticService.list(params, function (data) {
                if (data && data.data) {

                }
            });
        };
        // 折线图
        var option_flow = {
            animation: true,
            title: {
                text: '总流量'
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
                data: []
            }]
        };
        //IP TOP10
        var option_ip = {
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
                    type: 'category',
                    data: []
                }
            ],
            yAxis: [
                {
                    type: 'value'
                }
            ],
            series: [{
                name: '发送',
                type: 'bar',
                data: []
            }, {
                name: '接收',
                type: 'bar',
                data: []
            }]
        };
        //IP TOP10
        var option_protocol = {
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
                    type: 'category',
                    data: []
                }
            ],
            yAxis: [
                {
                    type: 'value'
                }
            ],
            series: [{
                name: '发送',
                type: 'bar',
                data: []
            }, {
                name: '接收',
                type: 'bar',
                data: []
            }]
        };
        $scope.init();
    });
});