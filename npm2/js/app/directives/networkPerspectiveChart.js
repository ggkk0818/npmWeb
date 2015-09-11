define([
  'angular',
  'app',
  'lodash'
],
function (angular, app, _) {
    'use strict';

    angular.module('app.directives').directive('networkPerspectiveServiceRecord', function ($compile, $window, $timeout) {
        return {
            restrict: 'C',
            link: function ($scope, elem) {
                var singleLineChartProp = [
                    { name: "flowRatio", tooltip: "kbps" },//流量速率
                    { name: "timeConnDuration", tooltip: "ms/sec" },//连接持续时间
                    { name: "connRatio", tooltip: "连接/sec" },//连接率
                    { name: "connRequestRatio", tooltip: "连接/sec" },//连接请求率
                    { name: "userResponseTime", tooltip: "ms" },//用户响应时间
                    { name: "timeRetrans", tooltip: "ms" },//重传延时
                    { name: "inPacketLossRatio", tooltip: "%" },//丢包率（流入）
                    { name: "outPacketLossRatio", tooltip: "%" },//丢包率（流出）
                    { name: "inPacketRetransRatio", tooltip: "重传/sec" },//包重传率（流入）
                    { name: "outPacketRetransRatio", tooltip: "重传/sec" },//包重传率（流出）
                    { name: "inRetransRatio", tooltip: "kbps" },//重传率（流入）
                    { name: "outRetransRatio", tooltip: "kbps" },//重传率（流出）
                    { name: "inNetPayloadTime", tooltip: "byte" },//净荷（流入）
                    { name: "outNetPayloadTime", tooltip: "byte" },//净荷（流出）
                    { name: "inNetPayloadTransTime", tooltip: "ms" },//净荷传输时间（流入）
                    { name: "outNetPayloadTransTime", tooltip: "ms" },//净荷传输时间（流出）
                    { name: "inTransTime", tooltip: "ms" },//数据传输时间（流入）
                    { name: "outTransTime", tooltip: "ms" },//数据传输时间（流出）
                ];
                var multiLineChartProp = [
                    //{ name: "transTime", props: ["outTransTime", "inTransTime"], tooltip: "ms", sum: true },//数据传输时间
                    //{ name: "netPayloadTransTime", props: ["outNetPayloadTransTime", "inNetPayloadTransTime"], tooltip: "ms", sum: true },//净荷传输时间
                    //{ name: "netPayloadTime", props: ["outNetPayloadTime", "inNetPayloadTime"], tooltip: "byte", sum: true },//净荷
                    //{ name: "packetLossRatio", props: ["outPacketLossRatio", "inPacketLossRatio"], tooltip: "%", sum: false },//丢包率
                    //{ name: "packetRetransRatio", props: ["outPacketRetransRatio", "inPacketRetransRatio"], tooltip: "重传/sec", sum: true },//包重传率
                    //{ name: "retransRatio", props: ["outRetransRatio", "inRetransRatio"], tooltip: "kbps", sum: true }//重传率
                    //{ name: "timeRetrans", props: ["outTimeRetrans", "inTimeRetrans"], tooltip: "ms", sum: true }//重传延时
                ];
                var simgleColumnChartProp = [
                    { name: "packet", tooltip: "pps" },//数据包
                    { name: "connection", tooltip: "连接/sec" },//连接数
                    { name: "clientResetRatio", tooltip: "重置/sec" },//重置率（客户端/流入）
                    { name: "serverResetRatio", tooltip: "重置/sec" },//重置率（服务器/流出）
                    { name: "inTurnRatio", tooltip: "交互/sec" },//流入交互率
                    { name: "outTurnRatio", tooltip: "交互/sec" }//流出交互率
                ];
                var multiColumnChartProp = [
                    { name: "turnRatio", props: ["outTurnRatio", "inTurnRatio"], tooltip: "交互/sec", sum: true },//交互率
                    //{ name: "resetRatio", props: ["clientResetRatio", "serverResetRatio"], tooltip: "个/sec", sum: true }//重置率
                ];
                var singlePieChartProp = [
                    { name: "outTurnCount", tooltip: "交互" },//交互个数（流出）
                    { name: "inTurnCount", tooltip: "交互" },//交互个数（流入）
                    { name: "connEstablishTime", tooltip: "ms" },//连接建立时间
                    { name: "firstByteTime", tooltip: "ms" },//第一个字节时间
                    { name: "newConnSuccessCount", tooltip: "连接" },//连接建立成功个数
                    { name: "connReqCount", tooltip: "连接" },//连接请求个数
                    { name: "connFailingCount", tooltip: "连接" },//连接失败个数
                    { name: "serverResponseTime", tooltip: "ms" }//服务器响应时间
                ];
                var init = function () {
                    if (!$scope.service || !$scope.service.metric)
                        return;
                    if ($scope.service.metric.time) {
                        for (var i = 0; i < $scope.service.metric.time.length; i++) {
                            if (typeof $scope.service.metric.time[i] === "number")
                                $scope.service.metric.time[i] = new Date($scope.service.metric.time[i]);
                        }
                    }
                    $(elem).find("[data-type]").data("dirty", true);
                    render();
                };
                var render = function () {
                    var $inviewEl = $(elem).find("[data-type]");
                    $inviewEl.each(function (k, el) {
                        var $el = $(el),
                            dataType = $el.data("type");
                        if (!$el.data("dirty") || !$el.is(":in-viewport"))
                            return true;
                        for (var index in singleLineChartProp) {
                            var prop = singleLineChartProp[index];
                            if (dataType == prop.name && $scope.service.metric[prop.name]) {
                                var chartData = [];
                                for (var i = 0; i < $scope.service.metric[prop.name].length; i++) {
                                    if (!$scope.service.metric.time || i >= $scope.service.metric.time.length)
                                        break;
                                    chartData.push({ time: $scope.service.metric.time[i], value: $scope.service.metric[prop.name][i] });
                                }
                                MG.data_graphic({
                                    data: chartData,
                                    full_width: true,
                                    height: 120,
                                    right: 20,
                                    top: 17,
                                    mouseover: (function (prop) {
                                        return function (d, i) {
                                            //custom format the rollover text, show days
                                            var str = (d.value || 0) + prop.tooltip + (d.time instanceof Date ? " " + d.time.Format("hh:mm:ss") : "");
                                            $el.find("svg .mg-active-datapoint").html(str);
                                        };
                                    })(prop),
                                    target: el,
                                    x_accessor: 'time',
                                    y_accessor: 'value'
                                });
                            }
                        }
                        for (var index in multiLineChartProp) {
                            var prop = multiLineChartProp[index],
                                chartDataArr = [];
                            if (dataType != prop.name)
                                continue;
                            if (prop.props) {
                                for (var j = 0; j < prop.props.length; j++) {
                                    var chartData = [];
                                    if ($scope.service.metric[prop.props[j]]) {
                                        for (var i = 0; i < $scope.service.metric[prop.props[j]].length; i++) {
                                            if (!$scope.service.metric.time || i >= $scope.service.metric.time.length)
                                                break;
                                            chartData.push({ time: $scope.service.metric.time[i], value: $scope.service.metric[prop.props[j]][i] });
                                        }
                                    }
                                    chartDataArr.push(chartData);
                                }
                            }
                            MG.data_graphic({
                                legend: ['流出', '流入'],
                                data: chartDataArr,
                                full_width: true,
                                height: 120,
                                right: 20,
                                top: 17,
                                mouseover: (function (prop) {
                                    return function (d, i) {
                                        //custom format the rollover text, show days
                                        var str = (d.value || 0) + prop.tooltip + (d.time instanceof Date ? " " + d.time.Format("hh:mm:ss") : "");
                                        $el.find("svg .mg-active-datapoint").html(str);
                                    };
                                })(prop),
                                target: el,
                                x_accessor: 'time',
                                y_accessor: 'value'
                            });
                        }
                        for (var index in simgleColumnChartProp) {
                            var prop = simgleColumnChartProp[index];
                            if (dataType == prop.name && $scope.service.metric[prop.name]) {
                                var categoryData = [];
                                for (var i = 0; i < $scope.service.metric.time.length; i++) {
                                    categoryData.push($scope.service.metric.time[i].Format("hh:mm"));
                                }
                                echarts.init(el).setOption({
                                    title: { show: false },
                                    tooltip: {
                                        trigger: 'axis',
                                        showDelay: 0,
                                        transitionDuration: 0,
                                        position: [120, 0],
                                        padding: [0, 0, 0, 0],
                                        backgroundColor: "rgba(255,255,255,1)",
                                        textStyle: { color: "#333", align: "right" },
                                        formatter: (function (prop) {
                                            return function (params) {
                                                var str = null;
                                                if (params && params.length) {
                                                    str = params[0].name + " ";
                                                    for (var i = 0; i < params.length; i++) {
                                                        var data = params[i];
                                                        str += data.value + prop.tooltip;
                                                    }
                                                }
                                                else {
                                                    str = "暂无信息";
                                                }
                                                return str;
                                            };
                                        })(prop)
                                    },
                                    legend: { show: false, data: [prop.name] },
                                    toolbox: { show: false },
                                    dataZoom: { show: false },
                                    grid: {
                                        x: 40,
                                        x2: 10,
                                        y: 20,
                                        y2: 40
                                    },
                                    xAxis: [{
                                        type: 'category',
                                        data: categoryData
                                    }],
                                    yAxis: [{
                                        type: 'value'
                                    }],
                                    series: [{
                                        name: prop.name,
                                        type: "bar",
                                        data: $scope.service.metric[prop.name]
                                    }]
                                }, true);
                                //var chartData = [];
                                //for (var i = 0; i < $scope.service.metric[prop.name].length; i++) {
                                //    if (!$scope.service.metric.time || i >= $scope.service.metric.time.length)
                                //        break;
                                //    chartData.push({ date: $scope.service.metric.time[i], value: $scope.service.metric[prop.name][i] });
                                //}
                                //MG.data_graphic({
                                //    chart_type: 'histogram',
                                //    data: chartData,
                                //    full_width: true,
                                //    height: 120,
                                //    right: 20,
                                //    top: 17,
                                //    mouseover: (function (prop) {
                                //        return function (d, i) {
                                //            //custom format the rollover text, show days
                                //            var str = (d.value || 0) + prop.tooltip + (d.date instanceof Date ? " " + d.date.Format("hh:mm:ss") : "");
                                //            $el.find("svg .mg-active-datapoint").html(str);
                                //        };
                                //    })(prop),
                                //    target: el,
                                //    bar_margin: 0,
                                //    binned: true
                                //});
                            }
                        }
                        for (var index in multiColumnChartProp) {
                            var prop = multiColumnChartProp[index],
                                categoryData = [],
                                chartDataArr = [];
                            if (dataType != prop.name)
                                continue;
                            for (var i = 0; i < $scope.service.metric.time.length; i++) {
                                categoryData.push($scope.service.metric.time[i].Format("hh:mm"));
                            }
                            if (prop.props) {
                                for (var j = 0; j < prop.props.length; j++) {
                                    chartDataArr.push({
                                        name: prop.props[j],
                                        type: "bar",
                                        data: $scope.service.metric[prop.props[j]] || []
                                    });
                                }
                            }
                            echarts.init(el).setOption({
                                title: { show: false },
                                tooltip: {
                                    trigger: 'axis',
                                    showDelay: 0,
                                    transitionDuration: 0,
                                    position: [120, 0],
                                    padding: [0, 0, 0, 0],
                                    backgroundColor: "rgba(255,255,255,1)",
                                    textStyle: { color: "#333", align: "right" },
                                    formatter: (function (prop) {
                                        return function (params) {
                                            var str = null;
                                            if (params && params.length) {
                                                str = params[0].name + " ";
                                                for (var i = 0; i < params.length; i++) {
                                                    var data = params[i];
                                                    str += (i == 0 ? "流出" : "流入") + ":" + data.value + prop.tooltip;
                                                }
                                            }
                                            else {
                                                str = "暂无信息";
                                            }
                                            return str;
                                        };
                                    })(prop)
                                },
                                legend: { show: false, data: prop.props },
                                toolbox: { show: false },
                                dataZoom: { show: false },
                                grid: {
                                    x: 40,
                                    x2: 10,
                                    y: 20,
                                    y2: 40
                                },
                                xAxis: [{
                                    type: 'category',
                                    data: categoryData
                                }],
                                yAxis: [{
                                    type: 'value'
                                }],
                                series: chartDataArr
                            }, true);
                        }
                        for (var index in singlePieChartProp) {
                            var prop = singlePieChartProp[index];
                            if (dataType == prop.name && $scope.service.metric[prop.name]) {
                                $el.find(".chart")
                                    .attr("data-percent", Math.round($scope.service.metric[prop.name]) || 0)
                                    .easyPieChart({
                                        easing: 'easeOutBounce',
                                        lineWidth: '10',
                                        scaleColor: true,
                                        barColor: '#d9534f',
                                        trackColor: '#B7ADAD',
                                        onStep: (function (prop, val) {
                                            return function (from, to, percent) {
                                                var str = null;
                                                if (isNaN(percent)) {
                                                    str = val && val.length ? Math.round(val[0]) + prop.tooltip : "N/A";
                                                }
                                                else {
                                                    str = Math.round(percent) + prop.tooltip;
                                                }
                                                $(this.el).find('.percent').text(str);
                                            };
                                        })(prop, $scope.service.metric[prop.name])
                                    });
                            }
                        }
                        $el.data("dirty", false);
                    });
                };
                var chartRenderTimer = null;
                $(window).on("scroll." + $scope.$id + " resize." + $scope.$id, function () {
                    if (chartRenderTimer)
                        clearTimeout(chartRenderTimer);
                    chartRenderTimer = setTimeout(render, 50);
                });
                $scope.$watch(function () {
                    var str = "";
                    if ($scope.service.metric && $scope.service.metric.time) {
                        for (var i = 0; i < $scope.service.metric.time.length; i++) {
                            str += new String($scope.service.metric.time[i]);
                        }
                    }
                    return str;
                }, function () {
                    init();
                });
                $scope.$on("$destroy", function () {
                    if (chartRenderTimer)
                        clearTimeout(chartRenderTimer);
                    $(window).off("scroll." + $scope.$id + " resize." + $scope.$id);
                });
            }
        };
    });
});