define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/flowSummary.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('FlowSummaryCtrl', function ($rootScope, $scope, $route, $timeout, $interval, $location, dateTimeService, flowService) {
        //初始化变量
        $scope.startDate = null;
        $scope.startTime = null;
        $scope.endTime = null;
        $scope.queryTimer = null;
        $scope.chartFlow = null;
        $scope.chartIp = null;
        $scope.chartProtocol = null;
        $scope.isConnect = true;
        $scope.isToday = false;
        //表单数据
        $scope.startDateInput = $scope.startDate = dateTimeService.serverTime.Format("yyyy-MM-dd");
        $scope.init = function () {
            $timeout(function () {
                $scope.chartFlow = echarts.init($("#flowChart").get(0), "blue").showLoading({ effect: "dynamicLine" });
                $scope.chartPackage = echarts.init($("#packageChart").get(0), "blue").showLoading({ effect: "dynamicLine" });
                $scope.chartIp = echarts.init($("#ipChart").get(0), "blue").showLoading({ effect: "dynamicLine" });
                $scope.chartProtocol = echarts.init($("#protocolChart").get(0), "blue").showLoading({ effect: "dynamicLine" });
                $scope.chartFlow.connect($scope.chartPackage);
                $scope.chartPackage.connect($scope.chartFlow);
            });
            $scope.setSearchParams();
            $scope.doQuery();
            $scope.queryTimer = $interval($scope.doQuery, 10 * 60 * 1000);
            if ($scope.startDate == dateTimeService.serverTime.Format("yyyy-MM-dd")) {
                $scope.isToday = true;
            }
        };
        //获取查询参数
        $scope.getSearchParams = function () {
            var params = {};
            if ($scope.startDate)
                params.startDate = $scope.startDate;
            return params;
        };
        //从url获取查询参数设置变量
        $scope.setSearchParams = function () {
            var params = $location.search();
            if (!params)
                return;
            if (params.startDate) {
                $scope.startDate = params.startDate;
                $scope.startDateInput = params.startDate;
            }
            if (params.startTime)
                $scope.startTime = params.startTime;
            if (params.endTime)
                $scope.endTime = params.endTime;
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
                        internetPackageData = [], intranetPackageData = [], totalPackageData = [],
                        categoryData = [];
                    if (data.data.length) {
                        for (var i = 0; i < data.data.length; i++) {
                            var d = data.data[i],
                                datetime = new Date(d.datetime).Format("hh:mm:ss"),
                                internet_bytes = (d.internet_send_bytes || 0) + (d.internet_rec_bytes || 0),
                                intranet_bytes = (d.intranet_send_bytes || 0) + (d.intranet_rec_bytes || 0),
                                internet_package = (d.internet_send_package || 0) + (d.internet_rec_package || 0),
                                intranet_package = (d.intranet_send_package || 0) + (d.intranet_rec_package || 0);
                            categoryData.push(datetime);
                            //internetFlowData.push({ value: [datetime, (internet_bytes * 8 / 1024).toFixed(1)] });
                            //intranetFlowData.push({ value: [datetime, (intranet_bytes * 8 / 1024).toFixed(1)] });
                            //totalFlowData.push({ value: [datetime, ((internet_bytes + intranet_bytes) * 8 / 1024).toFixed(1)] });
                            //internetPackageData.push({ value: [datetime, internet_package] });
                            //intranetPackageData.push({ value: [datetime, intranet_package] });
                            //totalPackageData.push({ value: [datetime, internet_package + intranet_package] });
                            internetFlowData.push((internet_bytes * 8 / 1024).toFixed(1));
                            intranetFlowData.push((intranet_bytes * 8 / 1024).toFixed(1));
                            totalFlowData.push(((internet_bytes + intranet_bytes) * 8 / 1024).toFixed(1));
                            internetPackageData.push(internet_package.toFixed(1));
                            intranetPackageData.push(intranet_package.toFixed(1));
                            totalPackageData.push((internet_package + intranet_package).toFixed(1));
                        }
                    }
                    //else if (!$scope.option_flow.series[0].data.length && !$scope.option_package.series[0].data.length) {
                    //    return;
                    //}
                    $scope.option_flow.xAxis[0].data = categoryData;
                    $scope.option_flow.series[0].data = totalFlowData;
                    $scope.option_flow.series[1].data = intranetFlowData;
                    $scope.option_flow.series[2].data = internetFlowData;
                    $scope.option_package.xAxis[0].data = categoryData;
                    $scope.option_package.series[0].data = totalPackageData;
                    $scope.option_package.series[1].data = intranetPackageData;
                    $scope.option_package.series[2].data = internetPackageData;
                    if ($scope.startTime || $scope.endTime) {
                        var startPoint = null,
                            endPoint = null;
                        if ($scope.startTime) {
                            var time = new Date($scope.startDate + " " + $scope.startTime);
                            if (!isNaN(time)) {
                                startPoint = (time.getHours() * 60 + time.getMinutes()) * 100 / (24 * 60);
                            }
                        }
                        if ($scope.endTime) {
                            var time = new Date($scope.startDate + " " + $scope.endTime);
                            if (!isNaN(time)) {
                                endPoint = (time.getHours() * 60 + time.getMinutes()) * 100 / (24 * 60);
                            }
                        }
                        if (!startPoint)
                            startPoint = endPoint >= 50 ? endPoint - 50 : 0;
                        else if (!endPoint)
                            endPoint = startPoint <= 50 ? startPoint + 50 : 100;
                        $scope.option_flow.dataZoom.end = endPoint;
                        $scope.option_flow.dataZoom.start = startPoint;
                        $scope.option_package.dataZoom.end = endPoint;
                        $scope.option_package.dataZoom.start = startPoint;
                    }
                    else if (!$scope.startDate || $scope.startDate == dateTimeService.serverTime.Format("yyyy-MM-dd")) {
                        var endPoint = Math.round((dateTimeService.serverTime.getHours() * 60 + dateTimeService.serverTime.getMinutes()) * 100 / (24 * 60));
                        if (endPoint < 50) {
                            endPoint = 50;
                        }
                        $scope.option_flow.dataZoom.end = endPoint;
                        $scope.option_flow.dataZoom.start = endPoint - 50;
                        $scope.option_package.dataZoom.end = endPoint;
                        $scope.option_package.dataZoom.start = endPoint - 50;
                    }
                    else {
                        $scope.option_flow.dataZoom.end = 100;
                        $scope.option_flow.dataZoom.start = 50;
                        $scope.option_package.dataZoom.end = 100;
                        $scope.option_package.dataZoom.start = 50;
                    }
                }
                $scope.chartFlow.hideLoading().setOption($scope.option_flow, true);
                $scope.chartPackage.hideLoading().setOption($scope.option_package, true);
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
        $scope.option_flow = {
            animation: false,
            title: {
                text: '流量（kbps）'
            },
            tooltip: {
                trigger: 'axis',
                formatter: function (params) {
                    var str = null;
                    if (params && params.length) {
                        str = params[0].name + "<br />";
                        for (var i = 0; i < params.length; i++) {
                            var data = params[i];
                            str += data.seriesName + ":" + data.value + "kbps<br />";
                        }
                    }
                    else {
                        str = "暂无信息";
                    }
                    return str;
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
            xAxis: [{
                type: 'category',
                data: []
            }],
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
        $scope.option_package = {
            animation: false,
            title: {
                text: '数据包（pps）'
            },
            tooltip: {
                trigger: 'axis',
                formatter: function (params) {
                    var str = null;
                    if (params && params.length) {
                        str = params[0].name + "<br />";
                        for (var i = 0; i < params.length; i++) {
                            var data = params[i];
                            str += data.seriesName + ":" + data.value + "pps<br />";
                        }
                    }
                    else {
                        str = "暂无信息";
                    }
                    return str;
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
            xAxis: [{
                type: 'category',
                data: []
            }],
            yAxis: [{
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

        $scope.toggleChartConnect = function () {
            if ($scope.isConnect) {
                $scope.chartFlow.disConnect($scope.chartPackage);
                $scope.chartPackage.disConnect($scope.chartFlow);
                $scope.isConnect = false;
            }
            else {
                $scope.chartFlow.connect($scope.chartPackage);
                $scope.chartPackage.connect($scope.chartFlow);
                $scope.isConnect = true;
            }
        };
        
        $scope.init();
        //离开该页事件
        $scope.$on("$routeChangeStart", function () {
            if ($scope.queryTimer)
                $interval.cancel($scope.queryTimer);
        });

    });
});
