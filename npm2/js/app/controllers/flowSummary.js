﻿define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/flowSummary.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('FlowSummaryCtrl', function ($rootScope, $scope, $route, $timeout, $interval, $location, dateTimeService, flowService, networkOverviewService) {
        //初始化变量
        $scope.DURATION_TYPE = [
            {id: "hour", name: "小时"},
            {id: "day", name: "天"}
        ];
        $scope.startDate = null;
        $scope.startHour = null;
        $scope.startTime = null;
        $scope.endTime = null;
        $scope.queryTimer = null;
        $scope.chartFlow = null;
        $scope.chartIp = null;
        $scope.chartProtocol = null;
        $scope.isConnect = true;
        $scope.defaultChartZoomSize = 12.5;
        $scope.isToday = false;
        $scope.startTimeTop10 = null;
        $scope.endTimeTop10 = null;
        $scope.startTimeTop10Temp = null;
        $scope.endTimeTop10Temp = null;
        $scope.durationType = $scope.DURATION_TYPE[1];
        //表单数据
        $scope.startDateInput = $scope.startDate = dateTimeService.serverTime.Format("yyyy-MM-dd");
        $scope.startHourInput = $scope.startHour = dateTimeService.serverTime.getHours();
        $scope.init = function () {
            $timeout(function () {
                $scope.chartFlow = echarts.init($("#flowChart").get(0)).showLoading({effect: "ring"}).on(echarts.config.EVENT.DATA_ZOOM, onChartZoom);
                $scope.chartPackage = echarts.init($("#packageChart").get(0)).showLoading({effect: "ring"}).on(echarts.config.EVENT.DATA_ZOOM, onChartZoom);
                $scope.chartIpCount = echarts.init($("#ipCountChart").get(0)).showLoading({effect: "ring"}).on(echarts.config.EVENT.DATA_ZOOM, onChartZoom);
                $scope.chartIpFlow = echarts.init($("#ipChartFlow").get(0)).showLoading({effect: "ring"});
                $scope.chartIpPackage = echarts.init($("#ipChartPackage").get(0)).showLoading({effect: "ring"});
                $scope.chartProtocolFlow = echarts.init($("#protocolChartFlow").get(0)).showLoading({effect: "ring"});
                $scope.chartProtocolPackage = echarts.init($("#protocolChartPackage").get(0)).showLoading({effect: "ring"});
                $scope.chartPortFlow = echarts.init($("#portChartFlow").get(0)).showLoading({effect: "ring"});
                $scope.chartPortPackage = echarts.init($("#portChartPackage").get(0)).showLoading({effect: "ring"});
                $scope.chartFlow.connect($scope.chartPackage);
                $scope.chartFlow.connect($scope.chartIpCount);
                $scope.chartPackage.connect($scope.chartFlow);
                $scope.chartPackage.connect($scope.chartIpCount);
                $scope.chartIpCount.connect($scope.chartFlow);
                $scope.chartIpCount.connect($scope.chartPackage);
                //小时选择控件
                $(".hour-selector").mouseenter(hourSelectorHover).mouseleave(hourSelectorLeave).find(".btn-group .btn").on("click.hourSelector", hourSelectorBtnClick);
            });
            $scope.setSearchParams();
            $scope.doQuery();
            $scope.queryTimer = $interval($scope.doQuery, 10 * 60 * 1000);
            if ($scope.startDate == dateTimeService.serverTime.Format("yyyy-MM-dd")) {
                if ($scope.durationType.id == "day" || $scope.startHour == dateTimeService.serverTime.getHours()) {
                    $scope.isToday = true;
                }
            }
        };
        //获取查询参数
        $scope.getSearchParams = function () {
            var params = {};
            if ($scope.startDate)
                params.startDate = $scope.startDate;
            if ($scope.startHour)
                params.startHour = $scope.startHour;
            if ($scope.durationType)
                params.durationType = $scope.durationType.id;
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
            if (params.startHour) {
                $scope.startHour = parseInt(params.startHour);
                $scope.startHourInput = parseInt(params.startHour);
                if ($scope.startHour < 0) {
                    $scope.startHour = 0;
                    $scope.startHourInput = 0;
                }
                else if ($scope.startHour > 23) {
                    $scope.startHour = 23;
                    $scope.startHourInput = 23;
                }
            }
            if (params.startTime) {
                $scope.startTime = params.startTime;
                var time = new Date($scope.startDate + " " + $scope.startTime);
                if (!isNaN(time)) {
                    $scope.startHour = time.getHours();
                    $scope.startHourInput = time.getHours();
                }
            }
            if (params.endTime)
                $scope.endTime = params.endTime;
            if (params.durationType) {
                for (var i = 0; i < $scope.DURATION_TYPE.length; i++) {
                    if (params.durationType == $scope.DURATION_TYPE[i].id)
                        $scope.durationType = $scope.DURATION_TYPE[i];
                }
            }
            if ($scope.durationType.id == "hour" && !params.startHour && params.startTime) {
                var pos = params.startTime.indexOf(":");
                if (pos > 0) {
                    $scope.startHour = parseInt(params.startTime.substring(0, pos));
                }
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
            if ($scope.durationType)
                params.timeType = $scope.durationType.id;
            if ($scope.startDate) {
                var hour = null;
                if ($scope.durationType.id == "hour") {
                    hour = $scope.startHour.toString() || "0";
                    if (hour.length == 1)
                        hour = "0" + hour;
                }
                params.startTime = $scope.startDate + " " + (hour ? hour : "00") + ":00:00";
                params.endTime = $scope.startDate + " " + (hour ? hour : "23") + ":59:59";
            }
            // 流量、包数折线图
            networkOverviewService.flow(params, function (data) {
                if (data && data.status == 200) {

                    $scope.option_flow.xAxis[0].data = data.time;
                    $scope.option_flow.series[0].data = data.flow;
                    $scope.option_flow.series[1].data = data.up_flow;
                    $scope.option_flow.series[2].data = data.down_flow;
                    $scope.option_package.xAxis[0].data = data.time;
                    $scope.option_package.series[0].data = data.packet;
                    $scope.option_package.series[1].data = data.up_packet;
                    $scope.option_package.series[2].data = data.down_packet;
                    if ($scope.startTime || $scope.endTime) {
                        var startPoint = null,
                            endPoint = null;
                        if ($scope.startTime) {
                            var time = new Date($scope.startDate + " " + $scope.startTime);
                            if (!isNaN(time)) {
                                if ($scope.durationType.id == "day") {
                                    startPoint = (time.getHours() * 60 + time.getMinutes()) * 100 / (24 * 60);
                                }
                                else {
                                    startPoint = time.getMinutes() * 100 / 60;
                                }
                            }
                        }
                        if ($scope.endTime) {
                            var time = new Date($scope.startDate + " " + $scope.endTime);
                            if (!isNaN(time)) {
                                if ($scope.durationType.id == "day") {
                                    endPoint = (time.getHours() * 60 + time.getMinutes()) * 100 / (24 * 60);
                                }
                                else if ($scope.durationType.id == "hour") {
                                    if ($scope.startHour == time.getHours())
                                        endPoint = time.getMinutes() * 100 / 60;
                                    else
                                        endPoint = 100;
                                }
                            }
                        }
                        if (!startPoint)
                            startPoint = endPoint >= $scope.defaultChartZoomSize ? endPoint - $scope.defaultChartZoomSize : 0;
                        else if (!endPoint)
                            endPoint = startPoint + $scope.defaultChartZoomSize <= 100 ? startPoint + $scope.defaultChartZoomSize : 100;
                        $scope.option_flow.dataZoom.end = endPoint;
                        $scope.option_flow.dataZoom.start = startPoint;
                        $scope.option_package.dataZoom.end = endPoint;
                        $scope.option_package.dataZoom.start = startPoint;
                        $scope.option_ipCount.dataZoom.end = endPoint;
                        $scope.option_ipCount.dataZoom.start = startPoint;
                    }
                    else if (!$scope.startDate || $scope.durationType.id == "day" && $scope.startDate == dateTimeService.serverTime.Format("yyyy-MM-dd")) {
                        var endPoint = Math.round((dateTimeService.serverTime.getHours() * 60 + dateTimeService.serverTime.getMinutes()) * 100 / (24 * 60));
                        if (endPoint < $scope.defaultChartZoomSize) {
                            endPoint = $scope.defaultChartZoomSize;
                        }
                        $scope.option_flow.dataZoom.end = endPoint;
                        $scope.option_flow.dataZoom.start = endPoint - $scope.defaultChartZoomSize;
                        $scope.option_package.dataZoom.end = endPoint;
                        $scope.option_package.dataZoom.start = endPoint - $scope.defaultChartZoomSize;
                        $scope.option_ipCount.dataZoom.end = endPoint;
                        $scope.option_ipCount.dataZoom.start = endPoint - $scope.defaultChartZoomSize;
                    }
                    else if ($scope.durationType.id == "hour" && $scope.startDate == dateTimeService.serverTime.Format("yyyy-MM-dd") && dateTimeService.serverTime.getHours() == $scope.startHour) {
                        var endPoint = dateTimeService.serverTime.getMinutes() * 100 / 60;
                        if (endPoint < $scope.defaultChartZoomSize) {
                            endPoint = $scope.defaultChartZoomSize;
                        }
                        $scope.option_flow.dataZoom.end = endPoint;
                        $scope.option_flow.dataZoom.start = endPoint - $scope.defaultChartZoomSize;
                        $scope.option_package.dataZoom.end = endPoint;
                        $scope.option_package.dataZoom.start = endPoint - $scope.defaultChartZoomSize;
                        $scope.option_ipCount.dataZoom.end = endPoint;
                        $scope.option_ipCount.dataZoom.start = endPoint - $scope.defaultChartZoomSize;
                    }
                    else {
                        $scope.option_flow.dataZoom.end = 100;
                        $scope.option_flow.dataZoom.start = 100 - $scope.defaultChartZoomSize;
                        $scope.option_package.dataZoom.end = 100;
                        $scope.option_package.dataZoom.start = 100 - $scope.defaultChartZoomSize;
                        $scope.option_ipCount.dataZoom.end = 100;
                        $scope.option_ipCount.dataZoom.start = 100 - $scope.defaultChartZoomSize;
                    }
                }
                else {
                    $scope.chartIpFlow.hideLoading();
                    $scope.chartIpPackage.hideLoading();
                    $scope.chartProtocolFlow.hideLoading();
                    $scope.chartProtocolPackage.hideLoading();
                    $scope.chartPortFlow.hideLoading();
                    $scope.chartPortPackage.hideLoading();
                }
                $scope.chartFlow.hideLoading().setOption($scope.option_flow, true);
                $scope.chartPackage.hideLoading().setOption($scope.option_package, true);
            });
            // 活跃IP
            networkOverviewService.activityIp(params, function (data) {
                if (data && data.status == 200) {
                    var chartData1 = data.ipCount;
                    $scope.option_ipCount.xAxis[0].data = data.time;
                    $scope.option_ipCount.series[0].data = chartData1;
                }
                $scope.chartIpCount.hideLoading().setOption($scope.option_ipCount, true);
            });
        };

        $scope.doQueryTop10 = function (params) {
            $scope.chartIpFlow.showLoading({effect: "ring"});
            $scope.chartIpPackage.showLoading({effect: "ring"});
            $scope.chartProtocolFlow.showLoading({effect: "ring"});
            $scope.chartProtocolPackage.showLoading({effect: "ring"});
            $scope.chartPortFlow.showLoading({effect: "ring"});
            $scope.chartPortPackage.showLoading({effect: "ring"});
            //查询IP流量 TOP10
            networkOverviewService.ipTopTen($.extend({}, params, {queryType: "FLOW"}), function (data) {
                if (data && data.status == 200) {
                    var axisData = data.ip || [],
                        chartData1 = data.up_flow || [],
                        chartData2 = data.down_flow || [];
                    option_ip_flow.yAxis[0].data = axisData.reverse();
                    option_ip_flow.series[0].data = chartData1.reverse();
                    option_ip_flow.series[1].data = chartData2.reverse();
                }
                $scope.chartIpFlow.hideLoading().setOption(option_ip_flow, true);
            });
            // 查询IP包数 TOP10
            networkOverviewService.ipTopTen($.extend({}, params, {queryType: "PACKAGE"}), function (data) {
                if (data && data.status == 200) {
                    var axisData = data.ip || [],
                        chartData1 = data.up_packet || [],
                        chartData2 = data.down_packet || [];
                    option_ip_package.yAxis[0].data = axisData.reverse();
                    option_ip_package.series[0].data = chartData1.reverse();
                    option_ip_package.series[1].data = chartData2.reverse();
                }
                $scope.chartIpPackage.hideLoading().setOption(option_ip_package, true);
            });
            //查询protocol流量 TOP10
            networkOverviewService.protocolTopTen($.extend({}, params, {queryType: "FLOW"}), function (data) {
                if (data && data.status == 200) {
                    var axisData = data.protocol || [],
                        chartData1 = data.up_flow || [],
                        chartData2 = data.down_flow || [];
                    option_protocol_flow.yAxis[0].data = axisData.reverse();
                    option_protocol_flow.series[0].data = chartData1.reverse();
                    option_protocol_flow.series[1].data = chartData2.reverse();
                }
                $scope.chartProtocolFlow.hideLoading().setOption(option_protocol_flow, true);
            });

            //查询protocol包数 TOP10
            networkOverviewService.protocolTopTen($.extend({}, params, {queryType: "PACKAGE"}), function (data) {
                if (data && data.status == 200) {
                    var axisData = data.protocol || [],
                        chartData1 = data.up_packet || [],
                        chartData2 = data.down_packet || [];
                    option_protocol_package.yAxis[0].data = axisData.reverse();
                    option_protocol_package.series[0].data = chartData1.reverse();
                    option_protocol_package.series[1].data = chartData2.reverse();
                }
                $scope.chartProtocolPackage.hideLoading().setOption(option_protocol_package, true);
            });

            //查询port 流量TOP10
            networkOverviewService.portTopTen($.extend({}, params, {queryType: "FLOW"}), function (data) {
                if (data && data.status == 200) {
                    var axisData = data.port || [],
                        chartData1 = data.up_flow || [],
                        chartData2 = data.down_flow || [];
                    option_port_flow.yAxis[0].data = axisData.reverse();
                    option_port_flow.series[0].data = chartData1.reverse();
                    option_port_flow.series[1].data = chartData2.reverse();
                }
                $scope.chartPortFlow.hideLoading().setOption(option_port_flow, true);

            });

            //查询port 包数TOP10
            networkOverviewService.portTopTen($.extend({}, params, {queryType: "PACKAGE"}), function (data) {
                if (data && data.status == 200) {
                    var axisData = data.port || [],
                        chartData1 = data.up_packet || [],
                        chartData2 = data.down_packet || [];
                    option_port_package.yAxis[0].data = axisData.reverse();
                    option_port_package.series[0].data = chartData1.reverse();
                    option_port_package.series[1].data = chartData2.reverse();
                }
                $scope.chartPortPackage.hideLoading().setOption(option_port_package, true);

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
                if ($scope.durationType.id == "day") {
                    date.setDate(date.getDate() + num);
                }
                else if (typeof $scope.startHour === "number") {
                    date.setHours($scope.startHour + num);
                }
                $scope.startDateInput = $scope.startDate = date.Format("yyyy-MM-dd");
                $scope.startHourInput = $scope.startHour = date.getHours();
            }
            else {
                $scope.startDateInput = $scope.startDate = dateTimeService.serverTime.Format("yyyy-MM-dd");
                $scope.startHourInput = $scope.startHour = dateTimeService.serverTime.getHours();
            }
            $scope.show();
        };
        //更改小时
        $scope.changeHour = function (h) {
            $scope.startHour = parseInt(h);
        };
        //更改时间类型
        $scope.changeDurationType = function (t) {
            $scope.durationType = t;
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
                showDelay: 0,
                transitionDuration: 0,
                position: [80, 30],
                padding: [5, 0, 5, 0],
                backgroundColor: "rgba(255,255,255,1)",
                textStyle: {color: "#333"},
                formatter: function (params) {
                    var str = null;
                    if (params && params.length) {
                        str = params[0].name + " ";
                        for (var i = 0; i < params.length; i++) {
                            var data = params[i];
                            str += data.seriesName + ":" + data.value + "kbps ";
                        }
                    }
                    else {
                        str = "暂无信息";
                    }
                    return str;
                }
            },
            legend: {
                data: ['总流量', '发送流量', '接收流量']
            },
            toolbox: {
                show: true,
                feature: {
                    mark: {show: false},
                    dataView: {show: false, readOnly: false},
                    restore: {show: false},
                    saveAsImage: {show: true}
                }
            },
            calculable: true,
            dataZoom: {
                show: false,
                y: 360,
                realtime: true,
                start: 50,
                end: 100
            },
            grid: {
                x2: 20,
                y2: 10
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
                name: '发送流量',
                type: 'line',
                smooth: true,
                symbol: 'none',
                //itemStyle: { normal: { areaStyle: { type: 'default' } } },
                data: []
            }, {
                name: '接收流量',
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
                showDelay: 0,
                transitionDuration: 0,
                position: [80, 30],
                padding: [5, 0, 5, 0],
                backgroundColor: "rgba(255,255,255,1)",
                textStyle: {color: "#333"},
                formatter: function (params) {
                    var str = null;
                    if (params && params.length) {
                        str = params[0].name + " ";
                        for (var i = 0; i < params.length; i++) {
                            var data = params[i];
                            str += data.seriesName + ":" + data.value + "pps ";
                        }
                    }
                    else {
                        str = "暂无信息";
                    }
                    return str;
                }
            },
            legend: {
                data: ['总数据包', '发送数据包', '接收数据包']
            },
            toolbox: {
                show: true,
                feature: {
                    mark: {show: false},
                    dataView: {show: false, readOnly: false},
                    restore: {show: false},
                    saveAsImage: {show: true}
                }
            },
            calculable: true,
            dataZoom: {
                show: false,
                y: 230,
                realtime: false,
                start: 50,
                end: 100
            },
            grid: {
                x2: 20,
                y2: 10
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
                name: '发送数据包',
                type: 'line',
                smooth: true,
                symbol: 'none',
                //itemStyle: { normal: { areaStyle: { type: 'default' } } },
                data: []
            }, {
                name: '接收数据包',
                type: 'line',
                smooth: true,
                symbol: 'none',
                //itemStyle: { normal: { areaStyle: { type: 'default' } } },
                data: []
            }]
        };


        // 活跃IP
        $scope.option_ipCount = {
            animation: false,
            title: {
                text: '活跃的服务器个数'
            },
            tooltip: {
                trigger: 'axis',
                showDelay: 0,
                transitionDuration: 0,
                position: [80, 30],
                padding: [5, 0, 5, 0],
                backgroundColor: "rgba(255,255,255,1)",
                textStyle: {color: "#333"},
                formatter: function (params) {
                    var str = null;
                    if (params && params.length) {
                        str = params[0].name + " ";
                        for (var i = 0; i < params.length; i++) {
                            var data = params[i];
                            str += data.seriesName + ":" + data.value + "ip ";
                        }
                    }
                    else {
                        str = "暂无信息";
                    }
                    return str;
                }
            },
            legend: {
                data: ['活跃服务器个数']
            },
            toolbox: {
                show: true,
                feature: {
                    mark: {show: false},
                    dataView: {show: false, readOnly: false},
                    restore: {show: false},
                    saveAsImage: {show: true}
                }
            },
            calculable: true,
            dataZoom: {
                show: true,
                y: 230,
                realtime: false,
                start: 50,
                end: 100
            },
            grid: {
                x2: 20,
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
                name: '活跃服务器个数',
                type: 'bar',
                smooth: true,
                symbol: 'none',
                data: []
            }]
        };
        //Ip TOP10
        var option_ip_flow = {
            animation: false,
            title: {
                text: 'IP top 10',
                subtext: '流量（kb）'
            },
            tooltip: {
                trigger: 'axis',
                showDelay: 0            // 显示延迟,添加显示延迟可以避免频繁切换,单位ms
            },
            grid: {
                x: 120,
                x2: 20
            },
            legend: {
                data: ['发送', '接收']
            },
            toolbox: {
                show: true,
                feature: {
                    mark: {show: false},
                    dataView: {show: false, readOnly: false},
                    magicType: {show: false, type: ['line', 'bar']},
                    restore: {show: false},
                    saveAsImage: {show: true}
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
                itemStyle: {normal: {label: {show: false, position: 'insideRight'}}},
                data: []
            }, {
                name: '接收',
                type: 'bar',
                stack: '总量',
                itemStyle: {normal: {label: {show: false, position: 'insideRight'}}},
                data: []
            }]
        };
        var option_ip_package = {
            animation: false,
            title: {
                text: 'Packet top 10',
                subtext: '数据包'
            },
            tooltip: {
                trigger: 'axis',
                showDelay: 0          // 显示延迟,添加显示延迟可以避免频繁切换,单位ms
            },
            grid: {
                x: 120,
                x2: 20
            },
            legend: {
                data: ['发送', '接收']
            },
            toolbox: {
                show: true,
                feature: {
                    mark: {show: false},
                    dataView: {show: false, readOnly: false},
                    magicType: {show: false, type: ['line', 'bar']},
                    restore: {show: false},
                    saveAsImage: {show: true}
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
                itemStyle: {normal: {label: {show: false, position: 'insideRight'}}},
                data: []
            }, {
                name: '接收',
                type: 'bar',
                stack: '总量',
                itemStyle: {normal: {label: {show: false, position: 'insideRight'}}},
                data: []
            }]
        };

        //协议 TOP10
        var option_protocol_flow = {
            animation: false,
            title: {
                text: '协议 top 10',
                subtext: '流量（kb）'
            },
            tooltip: {
                trigger: 'axis',
                showDelay: 0          // 显示延迟,添加显示延迟可以避免频繁切换,单位ms
            },
            grid: {
                x: 120,
                x2: 20
            },
            legend: {
                data: ['发送', '接收']
            },
            toolbox: {
                show: true,
                feature: {
                    mark: {show: false},
                    dataView: {show: false, readOnly: false},
                    magicType: {show: false, type: ['line', 'bar']},
                    restore: {show: false},
                    saveAsImage: {show: true}
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
                itemStyle: {normal: {label: {show: false, position: 'insideRight'}}},
                data: []
            }, {
                name: '接收',
                type: 'bar',
                stack: '总量',
                itemStyle: {normal: {label: {show: false, position: 'insideRight'}}},
                data: []
            }]
        };
        var option_protocol_package = {
            animation: false,
            title: {
                text: '协议 top 10',
                subtext: '数据包'
            },
            tooltip: {
                trigger: 'axis',
                showDelay: 0            // 显示延迟,添加显示延迟可以避免频繁切换,单位ms
            },
            grid: {
                x: 120,
                x2: 20
            },
            legend: {
                data: ['发送', '接收']
            },
            toolbox: {
                show: true,
                feature: {
                    mark: {show: false},
                    dataView: {show: false, readOnly: false},
                    magicType: {show: false, type: ['line', 'bar']},
                    restore: {show: false},
                    saveAsImage: {show: true}
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
                itemStyle: {normal: {label: {show: false, position: 'insideRight'}}},
                data: []
            }, {
                name: '接收',
                type: 'bar',
                stack: '总量',
                itemStyle: {normal: {label: {show: false, position: 'insideRight'}}},
                data: []
            }]
        };
        //端口 TOP10
        var option_port_flow = {
            animation: false,
            title: {
                text: '端口 top 10',
                subtext: '流量（kb）'
            },
            tooltip: {
                trigger: 'axis',
                showDelay: 0             // 显示延迟,添加显示延迟可以避免频繁切换,单位ms
            },
            grid: {
                x: 120,
                x2: 20
            },
            legend: {
                data: ['发送', '接收']
            },
            toolbox: {
                show: true,
                feature: {
                    mark: {show: false},
                    dataView: {show: false, readOnly: false},
                    magicType: {show: false, type: ['line', 'bar']},
                    restore: {show: false},
                    saveAsImage: {show: true}
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
                itemStyle: {normal: {label: {show: false, position: 'insideRight'}}},
                data: []
            }, {
                name: '接收',
                type: 'bar',
                stack: '总量',
                itemStyle: {normal: {label: {show: false, position: 'insideRight'}}},
                data: []
            }]
        };
        var option_port_package = {
            animation: false,
            title: {
                text: '端口 top 10',
                subtext: '数据包'
            },
            tooltip: {
                trigger: 'axis',
                showDelay: 0             // 显示延迟,添加显示延迟可以避免频繁切换,单位ms
            },
            grid: {
                x: 120,
                x2: 20
            },
            legend: {
                data: ['发送', '接收']
            },
            toolbox: {
                show: true,
                feature: {
                    mark: {show: false},
                    dataView: {show: false, readOnly: false},
                    magicType: {show: false, type: ['line', 'bar']},
                    restore: {show: false},
                    saveAsImage: {show: true}
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
                itemStyle: {normal: {label: {show: false, position: 'insideRight'}}},
                data: []
            }, {
                name: '接收',
                type: 'bar',
                stack: '总量',
                itemStyle: {normal: {label: {show: false, position: 'insideRight'}}},
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

        //图表缩放
        var onChartZoom = function (e) {
            var zoom = e.zoom;
            if ($scope.option_flow.series[0].data.length) {
                var start = Math.round(zoom.start / 100 * $scope.option_flow.series[0].data.length),
                    end = Math.round(zoom.end / 100 * $scope.option_flow.series[0].data.length) - 1,
                    startTime = $scope.startDate + " " + $scope.option_flow.xAxis[0].data[start],
                    endTime = $scope.startDate + " " + $scope.option_flow.xAxis[0].data[end];
                $scope.startTimeTop10Temp = startTime;
                $scope.endTimeTop10Temp = endTime;
                onMouseUp();
            }
        };
        var onMouseUp = function () {
            //$scope.$apply(function () {
            if (($scope.startTimeTop10Temp && $scope.startTimeTop10Temp != $scope.startTimeTop10)
                || ($scope.endTimeTop10Temp && $scope.endTimeTop10Temp != $scope.endTimeTop10)) {
                $scope.startTimeTop10 = $scope.startTimeTop10Temp;
                $scope.endTimeTop10 = $scope.endTimeTop10Temp;
                $scope.startTimeTop10Temp = null;
                $scope.endTimeTop10Temp = null;
                $scope.doQueryTop10({
                    startTime: $scope.startTimeTop10,
                    endTime: $scope.endTimeTop10
                });
            }
            //});
        };
        var onWindowResize = function () {
            $scope.chartFlow.resize();
            $scope.chartPackage.resize();
            $scope.chartIpFlow.resize();
            $scope.chartIpPackage.resize();
            $scope.chartProtocolFlow.resize();
            $scope.chartProtocolPackage.resize();
            $scope.chartPortFlow.resize();
            $scope.chartPortPackage.resize();
        };

        //小时选择控件事件
        var hourSelectorTimer = null;
        var hourSelectorHover = function () {
            var $hourSelector = $(this),
                $btnGroup = $hourSelector.children(".btn-group");
            if (!$btnGroup.hasClass("active")) {
                var width = $hourSelector.outerWidth(),
                    offsetLeft = $hourSelector.offset().left,
                    offsetRight = $(window).width() - offsetLeft - width,
                    max = (offsetLeft - 10) / width,
                    min = 23 - (offsetRight - 10) / width,
                    leftUnit = $scope.startHour > max ? max : $scope.startHour < min ? min : $scope.startHour;
                $scope.$apply(function () {
                    $btnGroup.addClass("active").css({left: "calc(-" + leftUnit * 100 + "% + " + leftUnit + "px)"});
                });
            }
            if (hourSelectorTimer) {
                clearTimeout(hourSelectorTimer);
                hourSelectorTimer = null;
            }
        };
        var hourSelectorLeave = function () {
            if (!hourSelectorTimer) {
                hourSelectorTimer = setTimeout(hourSelectorHide, 800);
            }
        };
        var hourSelectorHide = function () {
            var $hourSelector = $(".hour-selector"),
                $btnGroup = $hourSelector.children(".btn-group");
            $btnGroup.removeClass("active");
        };
        var hourSelectorBtnClick = function () {
            hourSelectorHide();
        };

        $scope.init();
        //窗口大小事件
        $(window).on("resize.flowSummary", onWindowResize);
        //鼠标按键事件
        //$("#flowChart, #packageChart").on("mouseup", onMouseUp);
        //离开该页事件
        $scope.$on("$routeChangeStart", function () {
            if ($scope.queryTimer)
                $interval.cancel($scope.queryTimer);
            $(window).off("resize.flowSummary");
        });

    });
});
