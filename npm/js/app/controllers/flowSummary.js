define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/statisticSearch.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('FlowSummaryCtrl', function ($rootScope, $scope, $route, $timeout, $interval, $location, dateTimeService, flowService) {
        //初始化变量
        $scope.startDate = null;
        $scope.queryTimer = null;
        $scope.chartFlow = null;
        $scope.chartIp = null;
        $scope.chartProtocol = null;
        //表单数据
        $scope.startDateInput = $scope.startDate = dateTimeService.serverTime.Format("yyyy-MM-dd");
        $scope.init = function () {
            $timeout(function () {
                $scope.chartFlow = echarts.init($("#flowChart").get(0), "blue").showLoading({ effect: "dynamicLine" });
                $scope.chartPackage = echarts.init($("#packageChart").get(0), "blue").showLoading({ effect: "dynamicLine" });
                $scope.chartIp = echarts.init($("#ipChart").get(0), "blue").showLoading({ effect: "dynamicLine" });
                $scope.chartProtocol = echarts.init($("#protocolChart").get(0), "blue").showLoading({ effect: "dynamicLine" });
            });
            $scope.setSearchParams();
            $scope.doQuery();
            $scope.queryTimer = $interval($scope.doQuery, 10 * 60 * 1000);
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
        //查询数据
        $scope.doQuery = function () {
            var params = {};
            if ($scope.startDate) {
                params.startTime = $scope.startDate + " 00:00:00";
                params.endTime = $scope.startDate + " 23:59:59";
            }
            flowService.timeFlow(params, function (data) {
                if (data && data.data) {
                    var internetFlowData = [], intranetFlowData = [], totalFlowData = [],
                        internetPackageData = [], intranetPackageData = [], totalPackageData = [];
                    if (data.data.length) {
                        for (var i = 0; i < data.data.length; i++) {
                            var d = data.data[i],
                                datetime = d.datetime,
                                internet_bytes = (d.internet_send_bytes || 0) + (d.internet_rec_bytes || 0),
                                intranet_bytes = (d.intranet_send_bytes || 0) + (d.intranet_rec_bytes || 0),
                                internet_package = (d.internet_send_package || 0) + (d.internet_rec_package || 0),
                                intranet_package = (d.intranet_send_package || 0) + (d.intranet_rec_package || 0);
                            internetFlowData.push({ value: [datetime, (internet_bytes * 8 / 1024).toFixed(1)] });
                            intranetFlowData.push({ value: [datetime, (intranet_bytes * 8 / 1024).toFixed(1)] });
                            totalFlowData.push({ value: [datetime, ((internet_bytes + intranet_bytes) * 8 / 1024).toFixed(1)] });
                            internetPackageData.push({ value: [datetime, internet_package] });
                            intranetPackageData.push({ value: [datetime, intranet_package] });
                            totalPackageData.push({ value: [datetime, internet_package + intranet_package] });
                        }
                    }
                    //else if (!option_flow.series[0].data.length && !option_package.series[0].data.length) {
                    //    return;
                    //}
                    option_flow.series[0].data = totalFlowData;
                    option_flow.series[1].data = intranetFlowData;
                    option_flow.series[2].data = internetFlowData;
                    option_package.series[0].data = totalPackageData;
                    option_package.series[1].data = intranetPackageData;
                    option_package.series[2].data = internetPackageData;
                }
                $scope.chartFlow.hideLoading().setOption(option_flow, true);
                $scope.chartPackage.hideLoading().setOption(option_package, true);
            });
            flowService.ipChart(params, function (data) {
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
                }
                $scope.chartIp.hideLoading().setOption(option_ip, true);
            });
            flowService.protocolChart(params, function (data) {
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
                }
                $scope.chartProtocol.hideLoading().setOption(option_protocol, true);
            });
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
            if (typeof num === "number") {
                var date = new Date($scope.startDate.replace(/-/g, "/"));
                date.setDate(date.getDate() + num);
                $scope.startDateInput = $scope.startDate = date.Format("yyyy-MM-dd");
            }
            else {
                $scope.startDateInput = $scope.startDate = dateTimeService.serverTime.Format("yyyy-MM-dd");
            }
            $scope.show();
        };

        // 折线图
        var option_flow = {
            animation: false,
            title: {
                text: '流量（kbpm）'
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
                data: ['总流量', '内网流量', '外网流量']
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
                start: 50,
                end: 100
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
                type: 'value'
            }],
            series: [{
                name: '总流量',
                type: 'line',
                smooth: true,
                symbol: 'none',
                //itemStyle: { normal: { areaStyle: { type: 'default' } } },
                data: []
            }, {
                name: '内网流量',
                type: 'line',
                smooth: true,
                symbol: 'none',
                //itemStyle: { normal: { areaStyle: { type: 'default' } } },
                data: []
            }, {
                name: '外网流量',
                type: 'line',
                smooth: true,
                symbol: 'none',
                //itemStyle: { normal: { areaStyle: { type: 'default' } } },
                data: []
            }]
        };
        // 数据包折线图
        var option_package = {
            animation: false,
            title: {
                text: '数据包（ppm）'
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
                data: ['总数据包', '内网数据包', '外网数据包']
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
                start: 50,
                end: 100
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
                type: 'value'
            }, {
                type: 'value'
            }],
            series: [{
                name: '总数据包',
                type: 'line',
                smooth: true,
                symbol: 'none',
                //itemStyle: { normal: { areaStyle: { type: 'default' } } },
                data: []
            }, {
                name: '内网数据包',
                type: 'line',
                smooth: true,
                symbol: 'none',
                //itemStyle: { normal: { areaStyle: { type: 'default' } } },
                data: []
            }, {
                name: '外网数据包',
                type: 'line',
                smooth: true,
                symbol: 'none',
                //itemStyle: { normal: { areaStyle: { type: 'default' } } },
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
