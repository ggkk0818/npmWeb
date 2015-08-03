define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/flowSummary.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('FlowSummaryCtrl', function ($rootScope, $scope, $route, $timeout, $interval, $location, dateTimeService, flowService) {
        //初始化变量
        $scope.DURATION_TYPE = [
            { id: "hour", name: "小时" },
            { id: "day", name: "天" }
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
                $scope.chartFlow = echarts.init($("#flowChart").get(0), "blue").showLoading({ effect: "ring" }).on(echarts.config.EVENT.DATA_ZOOM, onChartZoom);
                $scope.chartPackage = echarts.init($("#packageChart").get(0), "blue").showLoading({ effect: "ring" }).on(echarts.config.EVENT.DATA_ZOOM, onChartZoom);
                $scope.chartIpFlow = echarts.init($("#ipChartFlow").get(0), "blue").showLoading({ effect: "ring" });
                $scope.chartIpPackage = echarts.init($("#ipChartPackage").get(0), "blue").showLoading({ effect: "ring" });
                $scope.chartIpIntranetFlow = echarts.init($("#ipIntranetChartFlow").get(0), "blue").showLoading({ effect: "ring" });
                $scope.chartIpIntranetPackage = echarts.init($("#ipIntranetChartPackage").get(0), "blue").showLoading({ effect: "ring" });
                $scope.chartProtocolFlow = echarts.init($("#protocolChartFlow").get(0), "blue").showLoading({ effect: "ring" });
                $scope.chartProtocolPackage = echarts.init($("#protocolChartPackage").get(0), "blue").showLoading({ effect: "ring" });
                $scope.chartPortFlow = echarts.init($("#portChartFlow").get(0), "blue").showLoading({ effect: "ring" });
                $scope.chartPortPackage = echarts.init($("#portChartPackage").get(0), "blue").showLoading({ effect: "ring" });
                $scope.chartMacFlow = echarts.init($("#macChartFlow").get(0), "blue").showLoading({ effect: "ring" });
                $scope.chartMacPackage = echarts.init($("#macChartPackage").get(0), "blue").showLoading({ effect: "ring" });
                $scope.chartFlow.connect($scope.chartPackage);
                $scope.chartPackage.connect($scope.chartFlow);
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
                if($scope.durationType.id == "hour" ){
                    hour = $scope.startHour.toString() || "0";
                    if (hour.length == 1)
                        hour = "0" + hour;
                }
                params.startTime = $scope.startDate + " " + (hour? hour : "00") + ":00:00";
                params.endTime = $scope.startDate + " " + (hour? hour : "23") + ":59:59";
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
                    }
                    else {
                        $scope.option_flow.dataZoom.end = 100;
                        $scope.option_flow.dataZoom.start = 100 - $scope.defaultChartZoomSize;
                        $scope.option_package.dataZoom.end = 100;
                        $scope.option_package.dataZoom.start = 100 - $scope.defaultChartZoomSize;
                    }
                }
                else {
                    $scope.chartIpFlow.hideLoading();
                    $scope.chartIpPackage.hideLoading();
                    $scope.chartIpIntranetFlow.hideLoading();
                    $scope.chartIpIntranetPackage.hideLoading();
                    $scope.chartProtocolFlow.hideLoading();
                    $scope.chartProtocolPackage.hideLoading();
                    $scope.chartPortFlow.hideLoading();
                    $scope.chartPortPackage.hideLoading();
                    $scope.chartMacFlow.hideLoading();
                    $scope.chartMacPackage.hideLoading();
                }
                $scope.chartFlow.hideLoading().setOption($scope.option_flow, true);
                $scope.chartPackage.hideLoading().setOption($scope.option_package, true);
                //$timeout(function () {
                //    onMouseUp();
                //});
            });
        };

        $scope.doQueryTop10 = function (params) {
            $scope.chartIpFlow.showLoading({ effect: "ring" });
            $scope.chartIpPackage.showLoading({ effect: "ring" });
            $scope.chartIpIntranetFlow.showLoading({ effect: "ring" });
            $scope.chartIpIntranetPackage.showLoading({ effect: "ring" });
            $scope.chartProtocolFlow.showLoading({ effect: "ring" });
            $scope.chartProtocolPackage.showLoading({ effect: "ring" });
            $scope.chartPortFlow.showLoading({ effect: "ring" });
            $scope.chartPortPackage.showLoading({ effect: "ring" });
            $scope.chartMacFlow.showLoading({ effect: "ring" });
            $scope.chartMacPackage.showLoading({ effect: "ring" });
            //查询外网TOP10
            flowService.ipChart($.extend({}, params, { queryType: "FLOW" }), function (data) {
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
                    option_ip_flow.yAxis[0].data = axisData;
                    option_ip_flow.series[0].data = chartData1;
                    option_ip_flow.series[1].data = chartData2;
                }
                $scope.chartIpFlow.hideLoading().setOption(option_ip_flow, true);
            });
            flowService.ipChart($.extend({}, params, { queryType: "PACKAGE" }), function (data) {
                if (data && data.data) {
                    var axisData = [],
                        chartData1 = [],
                        chartData2 = [];
                    if (data.data.length) {
                        data.data = data.data.reverse();
                        for (var i = 0; i < data.data.length; i++) {
                            var d = data.data[i];
                            axisData.push(d.srcip);
                            chartData1.push({ name: d.srcip, value: d.sendPackage ? d.sendPackage.toFixed(1) : 0 });
                            chartData2.push({ name: d.srcip, value: d.recPackage ? d.recPackage.toFixed(1) : 0 });
                        }
                    }
                    option_ip_package.yAxis[0].data = axisData;
                    option_ip_package.series[0].data = chartData1;
                    option_ip_package.series[1].data = chartData2;
                }
                $scope.chartIpPackage.hideLoading().setOption(option_ip_package, true);
            });
            //查询内网TOP10
            flowService.ipIntranetChart($.extend({}, params, {queryType:"FLOW"}), function (data) {
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
                    option_ipIntranet_flow.yAxis[0].data = axisData;
                    option_ipIntranet_flow.series[0].data = chartData1;
                    option_ipIntranet_flow.series[1].data = chartData2;
                }
                $scope.chartIpIntranetFlow.hideLoading().setOption(option_ipIntranet_flow, true);
            });
            flowService.ipIntranetChart($.extend({}, params, { queryType: "PACKAGE" }), function (data) {
                if (data && data.data) {
                    var axisData = [],
                        chartData1 = [],
                        chartData2 = [];
                    if (data.data.length) {
                        data.data = data.data.reverse();
                        for (var i = 0; i < data.data.length; i++) {
                            var d = data.data[i];
                            axisData.push(d.srcip);
                            chartData1.push({ name: d.srcip, value: d.sendPackage ? d.sendPackage.toFixed(1) : 0 });
                            chartData2.push({ name: d.srcip, value: d.recPackage ? d.recPackage.toFixed(1) : 0 });
                        }
                    }
                    option_ipIntranet_package.yAxis[0].data = axisData;
                    option_ipIntranet_package.series[0].data = chartData1;
                    option_ipIntranet_package.series[1].data = chartData2;
                }
                $scope.chartIpIntranetPackage.hideLoading().setOption(option_ipIntranet_package, true);
            });
            //查询协议TOP10
            flowService.protocolChart(params, function (data) {
                if (data && data.data && data.data.length > 0) {
                    var axisData = [],
                        chartData1 = [],
                        chartData2 = [];
                    if (data.data[0].length) {
                        data.data[0] = data.data[0].reverse();
                        for (var i = 0; i < data.data[0].length; i++) {
                            var d = data.data[0][i];
                            axisData.push(d.protocol);
                            chartData1.push({ name: d.protocol, value: d.sendFlow ? (d.sendFlow * 8 / 1024).toFixed(1) : 0 });
                            chartData2.push({ name: d.protocol, value: d.recFlow ? (d.recFlow * 8 / 1024).toFixed(1) : 0 });
                        }
                    }
                    option_protocol_flow.yAxis[0].data = axisData;
                    option_protocol_flow.series[0].data = chartData1;
                    option_protocol_flow.series[1].data = chartData2;
                }
                $scope.chartProtocolFlow.hideLoading().setOption(option_protocol_flow, true);
                if (data && data.data && data.data.length > 1) {
                    var axisData = [],
                        chartData1 = [],
                        chartData2 = [];
                    if (data.data[1].length) {
                        data.data[1] = data.data[1].reverse();
                        for (var i = 0; i < data.data[1].length; i++) {
                            var d = data.data[1][i];
                            axisData.push(d.protocol);
                            chartData1.push({ name: d.protocol, value: d.sendPackage ? d.sendPackage.toFixed(1) : 0 });
                            chartData2.push({ name: d.protocol, value: d.recPackage ? d.recPackage.toFixed(1) : 0 });
                        }
                    }
                    option_protocol_package.yAxis[0].data = axisData;
                    option_protocol_package.series[0].data = chartData1;
                    option_protocol_package.series[1].data = chartData2;
                }
                $scope.chartProtocolPackage.hideLoading().setOption(option_protocol_package, true);
            });
            //查询端口TOP10
            flowService.portChart(params, function (data) {
                if (data && data.data && data.data.length > 0) {
                    var axisData = [],
                        chartData1 = [],
                        chartData2 = [];
                    if (data.data[0].length) {
                        data.data[0] = data.data[0].reverse();
                        for (var i = 0; i < data.data[0].length; i++) {
                            var d = data.data[0][i];
                            axisData.push(d.port);
                            chartData1.push({ name: d.port, value: d.sendFlow ? (d.sendFlow * 8 / 1024).toFixed(1) : 0 });
                            chartData2.push({ name: d.port, value: d.recFlow ? (d.recFlow * 8 / 1024).toFixed(1) : 0 });
                        }
                    }
                    option_port_flow.yAxis[0].data = axisData;
                    option_port_flow.series[0].data = chartData1;
                    option_port_flow.series[1].data = chartData2;
                }
                $scope.chartPortFlow.hideLoading().setOption(option_port_flow, true);
                if (data && data.data && data.data.length > 1) {
                    var axisData = [],
                        chartData1 = [],
                        chartData2 = [];
                    if (data.data[1].length) {
                        data.data[1] = data.data[1].reverse();
                        for (var i = 0; i < data.data[1].length; i++) {
                            var d = data.data[1][i];
                            axisData.push(d.port);
                            chartData1.push({ name: d.port, value: d.sendPackage ? d.sendPackage.toFixed(1) : 0 });
                            chartData2.push({ name: d.port, value: d.recPackage ? d.recPackage.toFixed(1) : 0 });
                        }
                    }
                    option_port_package.yAxis[0].data = axisData;
                    option_port_package.series[0].data = chartData1;
                    option_port_package.series[1].data = chartData2;
                }
                $scope.chartPortPackage.hideLoading().setOption(option_port_package, true);
            });
            //查询MAC TOP10
            flowService.macChart(params, function (data) {
                if (data && data.data && data.data.length > 0) {
                    var axisData = [],
                        chartData1 = [],
                        chartData2 = [];
                    if (data.data[0].length) {
                        data.data[0] = data.data[0].reverse();
                        for (var i = 0; i < data.data[0].length; i++) {
                            var d = data.data[0][i];
                            axisData.push(d.mac);
                            chartData1.push({ name: d.mac, value: d.sendFlow ? (d.sendFlow * 8 / 1024).toFixed(1) : 0 });
                            chartData2.push({ name: d.mac, value: d.recFlow ? (d.recFlow * 8 / 1024).toFixed(1) : 0 });
                        }
                    }
                    option_mac_flow.yAxis[0].data = axisData;
                    option_mac_flow.series[0].data = chartData1;
                    option_mac_flow.series[1].data = chartData2;
                }
                $scope.chartMacFlow.hideLoading().setOption(option_mac_flow, true);
                if (data && data.data && data.data.length > 1) {
                    var axisData = [],
                        chartData1 = [],
                        chartData2 = [];
                    if (data.data[1].length) {
                        data.data[1] = data.data[1].reverse();
                        for (var i = 0; i < data.data[1].length; i++) {
                            var d = data.data[1][i];
                            axisData.push(d.mac);
                            chartData1.push({ name: d.mac, value: d.sendPackage ? d.sendPackage.toFixed(1) : 0 });
                            chartData2.push({ name: d.mac, value: d.recPackage ? d.recPackage.toFixed(1) : 0 });
                        }
                    }
                    option_mac_package.yAxis[0].data = axisData;
                    option_mac_package.series[0].data = chartData1;
                    option_mac_package.series[1].data = chartData2;
                }
                $scope.chartMacPackage.hideLoading().setOption(option_mac_package, true);
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
                textStyle:{color:"#333"},
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
                showDelay: 0,
                transitionDuration: 0,
                position: [80, 30],
                padding: [5, 0, 5, 0],
                backgroundColor: "rgba(255,255,255,1)",
                textStyle: { color: "#333" },
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
        //外网 TOP10
        var option_ip_flow = {
            animation: false,
            title: {
                text: '外网 top 10',
                subtext: '流量（kb）'
            },
            tooltip: {
                trigger: 'axis'
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
        var option_ip_package = {
            animation: false,
            title: {
                text: '外网 top 10',
                subtext: '数据包'
            },
            tooltip: {
                trigger: 'axis'
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
        //内网 TOP10
        var option_ipIntranet_flow = {
            animation: false,
            title: {
                text: '内网 top 10',
                subtext: '流量（kb）'
            },
            tooltip: {
                trigger: 'axis'
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
        var option_ipIntranet_package = {
            animation: false,
            title: {
                text: '内网 top 10',
                subtext: '数据包'
            },
            tooltip: {
                trigger: 'axis'
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
        //协议 TOP10
        var option_protocol_flow = {
            animation: false,
            title: {
                text: '协议 top 10',
                subtext: '流量（kb）'
            },
            tooltip: {
                trigger: 'axis'
            },
            grid: {
                x2: 20
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
        var option_protocol_package = {
            animation: false,
            title: {
                text: '协议 top 10',
                subtext: '数据包'
            },
            tooltip: {
                trigger: 'axis'
            },
            grid: {
                x2: 20
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
        //端口 TOP10
        var option_port_flow = {
            animation: false,
            title: {
                text: '端口 top 10',
                subtext: '流量（kb）'
            },
            tooltip: {
                trigger: 'axis'
            },
            grid: {
                x2: 20
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
        var option_port_package = {
            animation: false,
            title: {
                text: '端口 top 10',
                subtext: '数据包'
            },
            tooltip: {
                trigger: 'axis'
            },
            grid: {
                x2: 20
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
        //MAC TOP10
        var option_mac_flow = {
            animation: false,
            title: {
                text: 'MAC top 10',
                subtext: '流量（kb）'
            },
            tooltip: {
                trigger: 'axis'
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
        var option_mac_package = {
            animation: false,
            title: {
                text: 'MAC top 10',
                subtext: '数据包'
            },
            tooltip: {
                trigger: 'axis'
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

        //图表缩放
        var onChartZoom = function (e) {
            var zoom = e.zoom;
            if ($scope.option_flow.series[0].data.length) {
                var start = Math.round(zoom.start / 100 * $scope.option_flow.series[0].data.length),
                    end = Math.round(zoom.end / 100 * $scope.option_flow.series[0].data.length) - 1,
                    startTime = $scope.startDate + " " +  $scope.option_flow.xAxis[0].data[start],
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
            $scope.chartIpIntranetFlow.resize();
            $scope.chartIpIntranetPackage.resize();
            $scope.chartProtocolFlow.resize();
            $scope.chartProtocolPackage.resize();
            $scope.chartPortFlow.resize();
            $scope.chartPortPackage.resize();
            $scope.chartMacFlow.resize();
            $scope.chartMacPackage.resize();
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
                    $btnGroup.addClass("active").css({ left: "calc(-" + leftUnit * 100 + "% + " + leftUnit + "px)" });
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
