define([
  'angular',
  'app',
  'lodash'
],
function (angular, app, _) {
    'use strict';

    angular.module('app.directives').directive('networkPerspectiveOpenServiceDetailChart', function ($compile, $window, $timeout) {
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
                    if (!$scope.metric || !$scope.metric.metrics)
                        return;
                    if ($scope.metric.metrics.time) {
                        for (var i = 0; i < $scope.metric.metrics.time.length; i++) {
                            if (typeof $scope.metric.metrics.time[i] === "number")
                                $scope.metric.metrics.time[i] = new Date($scope.metric.metrics.time[i]);
                        }
                    }
                    elem.children("div").data("dirty", true);
                    $timeout(function () {
                        render();
                    });
                };
                var render = function () {
                    var $el = elem.children("div"),
                        el = $el.get(0),
                        dataType = $scope.$parent.openServiceDetailRecord.dataType;
                    if (!$el.data("dirty"))
                        return true;
                    if (!$scope.metric.metrics.time || !$scope.metric.metrics.time.length)
                        return;
                    for (var index in singleLineChartProp) {
                        var prop = singleLineChartProp[index];
                        if (dataType == prop.name && $scope.metric.metrics[prop.name]) {
                            var chartData = [];
                            for (var i = 0; i < $scope.metric.metrics[prop.name].length; i++) {
                                if (!$scope.metric.metrics.time || i >= $scope.metric.metrics.time.length)
                                    break;
                                chartData.push({ time: $scope.metric.metrics.time[i], value: $scope.metric.metrics[prop.name][i] });
                            }
                            $el.html('<div></div>');
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
                                        $el.find("div svg .mg-active-datapoint").html(str);
                                    };
                                })(prop),
                                target: $el.children("div").get(0),
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
                                if ($scope.metric.metrics[prop.props[j]]) {
                                    for (var i = 0; i < $scope.metric.metrics[prop.props[j]].length; i++) {
                                        if (!$scope.metric.metrics.time || i >= $scope.metric.metrics.time.length)
                                            break;
                                        chartData.push({ time: $scope.metric.metrics.time[i], value: $scope.metric.metrics[prop.props[j]][i] });
                                    }
                                }
                                chartDataArr.push(chartData);
                            }
                        }
                        $el.html('<div></div>');
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
                                    $el.find("div svg .mg-active-datapoint").html(str);
                                };
                            })(prop),
                            target: $el.children("div").get(0),
                            x_accessor: 'time',
                            y_accessor: 'value'
                        });
                    }
                    for (var index in simgleColumnChartProp) {
                        var prop = simgleColumnChartProp[index];
                        if (dataType == prop.name && $scope.metric.metrics[prop.name]) {
                            var categoryData = [];
                            for (var i = 0; i < $scope.metric.metrics.time.length; i++) {
                                categoryData.push($scope.metric.metrics.time[i].Format("hh:mm"));
                            }
                            $el.html('<div style="height:120px;"></div>');
                            echarts.init($el.children("div").get(0)).setOption({
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
                                    data: $scope.metric.metrics[prop.name]
                                }]
                            }, true);
                        }
                    }
                    for (var index in multiColumnChartProp) {
                        var prop = multiColumnChartProp[index],
                            categoryData = [],
                            chartDataArr = [];
                        if (dataType != prop.name)
                            continue;
                        for (var i = 0; i < $scope.metric.metrics.time.length; i++) {
                            categoryData.push($scope.metric.metrics.time[i].Format("hh:mm"));
                        }
                        if (prop.props) {
                            for (var j = 0; j < prop.props.length; j++) {
                                chartDataArr.push({
                                    name: prop.props[j],
                                    type: "bar",
                                    data: $scope.metric.metrics[prop.props[j]] || []
                                });
                            }
                        }
                        $el.html('<div style="height:120px;"></div>');
                        echarts.init($el.children("div").get(0)).setOption({
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
                        if (dataType == prop.name && $scope.metric.metrics[prop.name]) {
                            $el.html('<p class="text-center">'
                                + '<span class="chart">'
                                + '<span class="percent"></span>'
                                + '</span>'
                                + '</p>');
                            $el.find(".chart")
                                .attr("data-percent", Math.round($scope.metric.metrics[prop.name]) || 0)
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
                                    })(prop, $scope.metric.metrics[prop.name])
                                });
                        }
                    }
                    $el.data("dirty", false);
                };
                //var chartRenderTimer = null;
                //$(window).on("scroll." + $scope.$id + " resize." + $scope.$id, function () {
                //    if (chartRenderTimer)
                //        clearTimeout(chartRenderTimer);
                //    chartRenderTimer = setTimeout(render, 50);
                //});
                $scope.$watch(function () {
                    var str = $scope.$parent.openServiceDetailRecord ? $scope.$parent.openServiceDetailRecord.dataType : "";
                    if ($scope.metric.metrics && $scope.metric.metrics.time) {
                        for (var i = 0; i < $scope.metric.metrics.time.length; i++) {
                            str += new String($scope.metric.metrics.time[i]);
                        }
                    }
                    return str;
                }, function () {
                    init();
                });
                $scope.$on("$destroy", function () {
                    //if (chartRenderTimer)
                    //    clearTimeout(chartRenderTimer);
                    //$(window).off("scroll." + $scope.$id + " resize." + $scope.$id);
                });
            }
        };
    });
});