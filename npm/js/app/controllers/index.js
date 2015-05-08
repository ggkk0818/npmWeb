define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/index.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('IndexCtrl', function ($rootScope, $scope, $route, $interval, $location, $timeout, $window, logService, statisticService, warningService, warningSocketService) {
        //告警时间线变量
        //$scope.warnTimeLine_warnList = [];
        $scope.warnTimeLine_warnS0 = [];
        $scope.warnTimeLine_warnS1 = [];
        $scope.warnTimeLine_warnS2 = [];
        $scope.warnTimeLine_warnS3 = [];
        $scope.warnTimeLine_warnS6 = [];
        $scope.warnTimeLine_warnS7 = [];


        $scope.warnTimeLine_loading = true;
        $scope.warnTimeLine_interval = 2;
        $scope.warnTimeLine_size = 3600;
        //拓扑图变量
        $scope.topology_startTime = null;
        $scope.topology_endTime = null;
        $scope.topology_8583_count = 0;
        $scope.topology_8583_duration = 0;
        $scope.topology_8583_successRatio = 0;
        $scope.topology_8583_responseRatio = 0;
        $scope.topology_8583_warnCount = 0;
        $scope.topology_8583_flow = 0;
        $scope.topology_8583_flowSuffix = "M";
        $scope.topology_8583_deviceList = [];
        $scope.topology_20022_count = 0;
        $scope.topology_20022_duration = 0;
        $scope.topology_20022_successRatio = 0;
        $scope.topology_20022_responseRatio = 0;
        $scope.topology_20022_warnCount = 0;
        $scope.topology_20022_flow = 0;
        $scope.topology_20022_flowSuffix = "M";
        $scope.topology_20022_deviceList = [];
        $scope.topology_http_count = 0;
        $scope.topology_http_duration = 0;
        $scope.topology_http_successRatio = 0;
        $scope.topology_http_responseRatio = 0;
        $scope.topology_http_warnCount = 0;
        $scope.topology_http_flow = 0;
        $scope.topology_http_flowSuffix = "M";
        $scope.topology_http_deviceList = [];
        $scope.topology_mysql_count = 0;
        $scope.topology_mysql_duration = 0;
        $scope.topology_mysql_successRatio = 0;
        $scope.topology_mysql_responseRatio = 0;
        $scope.topology_mysql_warnCount = 0;
        $scope.topology_mysql_flow = 0;
        $scope.topology_mysql_flowSuffix = "M";
        $scope.topology_mysql_deviceList = [];
        $scope.topology_mq_count = 0;
        $scope.topology_mq_duration = 0;
        $scope.topology_mq_successRatio = 0;
        $scope.topology_mq_responseRatio = 0;
        $scope.topology_mq_warnCount = 0;
        $scope.topology_mq_flow = 0;
        $scope.topology_mq_flowSuffix = "M";
        $scope.topology_mq_deviceList = [];
        //初始化
        $scope.init = function () {
            //告警时间线
            var now = new Date();
            for (var i = $scope.warnTimeLine_size; i >= 0; i--) {
                var time = new Date(now.getTime() - $scope.warnTimeLine_interval * i * 1000);
                var data = {warnTime: time, value: [time, "-",]};
                $scope.warnTimeLine_warnS2.push(data);

            }
            var warnQueryStartTime = new Date(now.getTime() - $scope.warnTimeLine_size * $scope.warnTimeLine_interval * 1000).Format("yyyy-MM-dd hh:mm:ss");
            var warnQueryDone = function (data, type) {
                if (data && data.state == 200 && data.data) {
                    for (var i = 0; i < data.data.length; i++) {
                        var warn = data.data[i];
                        var status = warn.status;
                        warn.warnTime = new Date(warn.warnTime);
                        warn.value = [warn.warnTime, warn.respmills, warn.protocol, warn.src_ip, warn.dest_ip];
                        warn.type = type;
                        if (status === 7)
                            warn.value[1] = 5000;
                        if (typeof status === "number" && $scope["warnTimeLine_warnS" + status]) {
                            $scope["warnTimeLine_warnS" + status].push(warn);
                        }
                    }
                }
                $scope.warnTimeLine_loading = false;
            };
            warningService.list({
                //type: "iso8583",
                startWarnTime: warnQueryStartTime,
                start: 0,
                limit: 0
            }, function (data) {
                warnQueryDone(data, "iso8583");
            });

            //$scope.warnTimeLine_warnList.sort(function (o1, o2) {
            //    var o1time = o1.warnTime.getTime();
            //    var o2time = o2.warnTime.getTime();
            //    return o1time > o2time ? -1 : o1time < o2time ? 1 : 0;
            //});

            if (!warningSocketService.isOpen())
                warningSocketService.open();
            warningSocketService.on("onmessage.indexWarnTimeLine", function (e) {
                if (e && e.data) {
                    var socketData = null;
                    try {
                        socketData = JSON.parse(e.data);
                    }
                    catch (err) {
                    }
                    if (socketData && socketData.type)
                        return;
                    else if (socketData && socketData.warn && socketData.warn.length) {
                        for (var i = 0; i < socketData.warn.length; i++) {
                            var warn = socketData.warn[i];
                            var status = warn.status;
                            warn.warnTime = new Date(warn.warnTime);
                            warn.value = [warn.warnTime, warn.respmills, warn.protocol, warn.src_ip, warn.dest_ip];
                            if (status === 7)
                                warn.value[1] = 5000;
                            if (typeof status === "number" && $scope["warnTimeLine_warnS" + status]) {
                                $scope["warnTimeLine_warnS" + status].push(warn);
                            }
                        }
                    }
                }
            });
            warnTimeLineTimer = $interval(warnTimeLineTimerTick, $scope.warnTimeLine_interval * 1000);
            //拓扑图查询
            $scope.topology_query();
            topologyTimer = $interval($scope.topology_query, 60000);
            //初始化图表
            $timeout(function () {
                chart_warn = echarts.init($("#index_chart_warn")[0], "blue");
                chart_warn.setOption(chart_warn_options);
                chart_http = echarts.init($("#index_chart_http")[0], "blue");
                chart_http.setOption(chart_http_options, true);
                chart_8583 = echarts.init($("#index_chart_8583")[0], "blue");
                chart_8583.setOption(chart_8583_options, true);
                chart_20022 = echarts.init($("#index_chart_20022")[0], "blue");
                chart_20022.setOption(chart_20022_options, true);
                chart_mq = echarts.init($("#index_chart_mq")[0], "blue");
                chart_mq.setOption(chart_mq_options, true);
            });


        };
        //告警时间线增加块
        var warnTimeLineTimer = null;
        var warnTimeLineTimerTick = function () {
            var now = new Date();
            var allWarn = [
                $scope.warnTimeLine_warnS1,
                $scope.warnTimeLine_warnS2,
                $scope.warnTimeLine_warnS3,
                $scope.warnTimeLine_warnS7
            ];
            for (var j = 0; j < allWarn.length; j++) {
                var warnArr = allWarn[j];
                for (var i = 0; i < warnArr.length; i++) {
                    var warn = warnArr[i];
                    if (warn.warnTime && now.getTime() - warn.warnTime.getTime() >
                        $scope.warnTimeLine_size * $scope.warnTimeLine_interval * 1000) {
                        warnArr.splice(i, 1);
                        i--;
                    }
                }
            }

            $scope.warnTimeLine_warnS1.push({warnTime: now, value: [now, "-", "-"]});
        };
        //告警时间线点击跳转
        $scope.warnTimeLine_query = function (warn) {
            var params = {};
            if (warn && warn.type)
                params.type = warn.type;
            if (warn && warn.time) {
                params.startTime = warn.time.Format("yyyy-MM-dd hh:mm:ss");
                params.endTime = new Date(warn.time.getTime() + $scope.warnTimeLine_interval * 1000).Format("yyyy-MM-dd hh:mm:ss");
            }
            $location.path("/warning").search(params);
        };
        //查询拓扑图数据
        var topologyTimer = null;
        $scope.topology_query = function () {
            var now = new Date(), start = new Date(now.getTime() - 60000);
            $scope.topology_startTime = start.Format("yyyy-MM-dd hh:mm:ss");
            $scope.topology_endTime = now.Format("yyyy-MM-dd hh:mm:ss");
            //$scope.topology_startTime = "2015-02-09 11:53:00";
            //$scope.topology_endTime = "2015-02-09 11:54:00";
            var sortFunc = function (a, b) {
                var val1 = a.count || 0;
                var val2 = b.count || 0;
                return val1 > val2 ? -1 : val1 < val2 ? 1 : 0;
            };
            // 8583
            statisticService.showTopology({
                type: "8583",
                starttime: $scope.topology_startTime,
                endtime: $scope.topology_endTime
            }, function (data) {
                if (data && data.state == "200") {
                    if (data.data && data.data.length) {
                        var row = data.data[0];
                        $scope.topology_8583_count = row.count || 0;
                        $scope.topology_8583_duration = row.maxDuration || 0;
                        $scope.topology_8583_successRatio = row.count > 0 && row.scount > 0 ? Math.round(row.scount * 10000 / row.count) / 100 : 0;
                        $scope.topology_8583_responseRatio = row.count > 0 && row.rcount > 0 ? Math.round(row.rcount * 10000 / row.count) / 100 : 0;
                        if (typeof row.allflow === "number") {
                            var flow = numeral(row.allflow).format("0b");
                            $scope.topology_8583_flow = /\d+/.exec(flow)[0];
                            $scope.topology_8583_flowSuffix = /[a-zA-Z]+/.exec(flow)[0];
                        }
                        else {
                            $scope.topology_8583_flow = 0;
                            $scope.topology_8583_flowSuffix = "M";
                        }
                    }
                }
            });
            statisticService.showDevice({
                type: "8583",
                starttime: $scope.topology_startTime,
                endtime: $scope.topology_endTime
            }, function (data) {
                if (data && data.state == "200") {
                    data.data = data.data.sort(sortFunc);
                    if (data.data.length > 5)
                        data.data.splice(5);
                    $scope.topology_8583_deviceList = data.data;
                    for (var i = 0; i < $scope.topology_8583_deviceList.length; i++) {
                        var record = $scope.topology_8583_deviceList[i];
                        if (typeof record.allflow === "number") {
                            record.allflow = numeral(record.allflow).format("0b");
                        }
                    }
                    //查询告警信息
                    warningService.showDevice({
                        type: "iso8583",
                        startWarnTime: $scope.topology_startTime,
                        endWarnTime: $scope.topology_endTime,
                        start: 0,
                        limit: 0
                    }, function (data2) {
                        if (data2 && data2.data) {
                            for (var i = 0; i < data2.data.length; i++) {
                                var warnRecord = data2.data[i];
                                for (var j = 0; j < $scope.topology_8583_deviceList.length; j++) {
                                    var record = $scope.topology_8583_deviceList[j];
                                    if (warnRecord.srcip == record.srcip && warnRecord.dstip == record.dstip) {
                                        record.warnCount = warnRecord.count;
                                    }
                                }
                            }
                        }
                    });
                }
            });
            warningService.list({
                type: "iso8583",
                startWarnTime: $scope.topology_startTime,
                endWarnTime: $scope.topology_endTime,
                start: 0,
                limit: 1
            }, function (data) {
                if (data && data.count) {
                    $scope.topology_8583_warnCount = data.count;
                }
                else
                    $scope.topology_8583_warnCount = 0;
            });
            // 20022
            statisticService.showTopology({
                type: "20022",
                starttime: $scope.topology_startTime,
                endtime: $scope.topology_endTime
            }, function (data) {
                if (data && data.state == "200") {
                    if (data.data && data.data.length) {
                        var row = data.data[0];
                        $scope.topology_20022_count = row.count || 0;
                        $scope.topology_20022_duration = row.maxDuration || 0;
                        $scope.topology_20022_successRatio = row.count > 0 && row.scount > 0 ? Math.round(row.scount * 10000 / row.count) / 100 : 0;
                        $scope.topology_20022_responseRatio = row.count > 0 && row.rcount > 0 ? Math.round(row.rcount * 10000 / row.count) / 100 : 0;
                        if (typeof row.allflow === "number") {
                            var flow = numeral(row.allflow).format("0b");
                            $scope.topology_20022_flow = /\d+/.exec(flow)[0];
                            $scope.topology_20022_flowSuffix = /[a-zA-Z]+/.exec(flow)[0];
                        }
                        else {
                            $scope.topology_20022_flow = 0;
                            $scope.topology_20022_flowSuffix = "M";
                        }
                    }
                }
            });

            statisticService.showDevice({
                type: "20022",
                starttime: $scope.topology_startTime,
                endtime: $scope.topology_endTime
            }, function (data) {
                if (data && data.state == "200") {
                    $scope.topology_20022_deviceList = data.data;
                    for (var i = 0; i < $scope.topology_20022_deviceList.length; i++) {
                        var record = $scope.topology_20022_deviceList[i];
                        if (typeof record.allflow === "number") {
                            record.allflow = numeral(record.allflow).format("0b");
                        }
                    }
                    //查询告警信息
                    warningService.showDevice({
                        type: "iso20022",
                        startWarnTime: $scope.topology_startTime,
                        endWarnTime: $scope.topology_endTime,
                        start: 0,
                        limit: 0
                    }, function (data2) {
                        if (data2 && data2.data) {
                            for (var i = 0; i < data2.data.length; i++) {
                                var warnRecord = data2.data[i];
                                for (var j = 0; j < $scope.topology_20022_deviceList.length; j++) {
                                    var record = $scope.topology_20022_deviceList[j];
                                    if (warnRecord.srcip == record.srcip && warnRecord.dstip == record.dstip) {
                                        record.warnCount = warnRecord.count;
                                    }
                                }
                            }
                        }
                    });
                }
            });
            warningService.list({
                type: "iso20022",
                startWarnTime: $scope.topology_startTime,
                endWarnTime: $scope.topology_endTime,
                start: 0,
                limit: 1
            }, function (data) {
                if (data && data.count) {
                    $scope.topology_20022_warnCount = data.count;
                }
                else
                    $scope.topology_20022_warnCount = 0;
            });
            // http
            statisticService.showTopology({
                type: "http",
                starttime: $scope.topology_startTime,
                endtime: $scope.topology_endTime
            }, function (data) {
                if (data && data.state == "200") {
                    if (data.data && data.data.length) {
                        var row = data.data[0];
                        $scope.topology_http_count = row.count || 0;
                        $scope.topology_http_duration = row.maxDuration || 0;
                        $scope.topology_http_successRatio = row.count > 0 && row.scount > 0 ? Math.round(row.scount * 10000 / row.count) / 100 : 0;
                        $scope.topology_http_responseRatio = row.count > 0 && row.rcount > 0 ? Math.round(row.rcount * 10000 / row.count) / 100 : 0;
                        if (typeof row.allflow === "number") {
                            var flow = numeral(row.allflow).format("0b");
                            $scope.topology_http_flow = /\d+/.exec(flow)[0];
                            $scope.topology_http_flowSuffix = /[a-zA-Z]+/.exec(flow)[0];
                        }
                        else {
                            $scope.topology_http_flow = 0;
                            $scope.topology_http_flowSuffix = "M";
                        }
                    }
                }
            });
            statisticService.showDevice({
                type: "http",
                starttime: $scope.topology_startTime,
                endtime: $scope.topology_endTime
            }, function (data) {
                if (data && data.state == "200") {
                    data.data = data.data.sort(sortFunc);
                    if (data.data.length > 5)
                        data.data.splice(5);
                    $scope.topology_http_deviceList = data.data;
                    for (var i = 0; i < $scope.topology_http_deviceList.length; i++) {
                        var record = $scope.topology_http_deviceList[i];
                        if (typeof record.allflow === "number") {
                            record.allflow = numeral(record.allflow).format("0b");
                        }
                    }
                    //查询告警信息
                    warningService.showDevice({
                        type: "http",
                        startWarnTime: $scope.topology_startTime,
                        endWarnTime: $scope.topology_endTime,
                        start: 0,
                        limit: 0
                    }, function (data2) {
                        if (data2 && data2.data) {
                            for (var i = 0; i < data2.data.length; i++) {
                                var warnRecord = data2.data[i];
                                for (var j = 0; j < $scope.topology_http_deviceList.length; j++) {
                                    var record = $scope.topology_http_deviceList[j];
                                    if (warnRecord.srcip == record.srcip && warnRecord.dstip == record.dstip) {
                                        record.warnCount = warnRecord.count;
                                    }
                                }
                            }
                        }
                    });
                }
            });
            warningService.list({
                type: "http",
                startWarnTime: $scope.topology_startTime,
                endWarnTime: $scope.topology_endTime,
                start: 0,
                limit: 1
            }, function (data) {
                if (data && data.count) {
                    $scope.topology_http_warnCount = data.count;
                }
                else
                    $scope.topology_http_warnCount = 0;
            });

            // mysql
            statisticService.showTopology({
                type: "mysql",
                starttime: $scope.topology_startTime,
                endtime: $scope.topology_endTime
            }, function (data) {
                if (data && data.state == "200") {
                    if (data.data && data.data.length) {
                        var row = data.data[0];
                        $scope.topology_mysql_count = row.count || 0;
                        $scope.topology_mysql_duration = row.maxDuration || 0;
                        $scope.topology_mysql_successRatio = row.count > 0 && row.scount > 0 ? Math.round(row.scount * 10000 / row.count) / 100 : 0;
                        $scope.topology_mysql_responseRatio = row.count > 0 && row.rcount > 0 ? Math.round(row.rcount * 10000 / row.count) / 100 : 0;

                        if (typeof row.allflow === "number") {
                            var flow = numeral(row.allflow).format("0b");
                            $scope.topology_mysql_flow = /\d+/.exec(flow)[0];
                            $scope.topology_mysql_flowSuffix = /[a-zA-Z]+/.exec(flow)[0];
                        }
                        else {
                            $scope.topology_mysql_flow = 0;
                            $scope.topology_mysql_flowSuffix = "M";
                        }
                    }
                }
            });
            statisticService.showDevice({
                type: "mysql",
                starttime: $scope.topology_startTime,
                endtime: $scope.topology_endTime
            }, function (data) {
                if (data && data.state == "200") {
                    $scope.topology_mysql_deviceList = data.data;
                    for (var i = 0; i < $scope.topology_mysql_deviceList.length; i++) {
                        var record = $scope.topology_mysql_deviceList[i];
                        if (typeof record.allflow === "number") {
                            record.allflow = numeral(record.allflow).format("0b");
                        }
                    }
                    //查询告警信息
                    warningService.showDevice({
                        type: "mysql",
                        startWarnTime: $scope.topology_startTime,
                        endWarnTime: $scope.topology_endTime,
                        start: 0,
                        limit: 0
                    }, function (data2) {
                        if (data2 && data2.data) {
                            for (var i = 0; i < data2.data.length; i++) {
                                var warnRecord = data2.data[i];
                                for (var j = 0; j < $scope.topology_mysql_deviceList.length; j++) {
                                    var record = $scope.topology_mysql_deviceList[j];
                                    if (warnRecord.srcip == record.srcip && warnRecord.dstip == record.dstip) {
                                        record.warnCount = warnRecord.count;
                                    }
                                }
                            }
                        }
                    });
                }
            });
            warningService.list({
                type: "mysql",
                startWarnTime: $scope.topology_startTime,
                endWarnTime: $scope.topology_endTime,
                start: 0,
                limit: 1
            }, function (data) {
                if (data && data.count) {
                    $scope.topology_mysql_warnCount = data.count;
                }
                else
                    $scope.topology_mysql_warnCount = 0;
            });
            //MQ
            statisticService.showTopology({
                type: "mq",
                starttime: $scope.topology_startTime,
                endtime: $scope.topology_endTime
            }, function (data) {
                if (data && data.state == "200") {
                    if (data.data && data.data.length) {
                        var row = data.data[0];
                        $scope.topology_mq_count = row.count || 0;
                        $scope.topology_mq_duration = row.maxDuration || 0;
                        $scope.topology_mq_successRatio = row.count > 0 && row.scount > 0 ? Math.round(row.scount * 10000 / row.count) / 100 : 0;
                        $scope.topology_mq_responseRatio = row.count > 0 && row.rcount > 0 ? Math.round(row.rcount * 10000 / row.count) / 100 : 0;

                        if (typeof row.allflow === "number") {
                            var flow = numeral(row.allflow).format("0b");
                            $scope.topology_mq_flow = /\d+/.exec(flow)[0];
                            $scope.topology_mq_flowSuffix = /[a-zA-Z]+/.exec(flow)[0];
                        }
                        else {
                            $scope.topology_mq_flow = 0;
                            $scope.topology_mq_flowSuffix = "M";
                        }
                    }
                }
            });
            statisticService.showDevice({
                type: "mq",
                starttime: $scope.topology_startTime,
                endtime: $scope.topology_endTime
            }, function (data) {
                if (data && data.state == "200") {
                    $scope.topology_mq_deviceList = data.data;
                    for (var i = 0; i < $scope.topology_mq_deviceList.length; i++) {
                        var record = $scope.topology_mq_deviceList[i];
                        if (typeof record.allflow === "number") {
                            record.allflow = numeral(record.allflow).format("0b");
                        }
                    }
                    //查询告警信息
                    warningService.showDevice({
                        type: "mq",
                        startWarnTime: $scope.topology_startTime,
                        endWarnTime: $scope.topology_endTime,
                        start: 0,
                        limit: 0
                    }, function (data2) {
                        if (data2 && data2.data) {
                            for (var i = 0; i < data2.data.length; i++) {
                                var warnRecord = data2.data[i];
                                for (var j = 0; j < $scope.topology_mq_deviceList.length; j++) {
                                    var record = $scope.topology_mq_deviceList[j];
                                    if (warnRecord.srcip == record.srcip && warnRecord.dstip == record.dstip) {
                                        record.warnCount = warnRecord.count;
                                    }
                                }
                            }
                        }
                    });
                }
            });
            warningService.list({
                type: "mq",
                startWarnTime: $scope.topology_startTime,
                endWarnTime: $scope.topology_endTime,
                start: 0,
                limit: 1
            }, function (data) {
                if (data && data.count) {
                    $scope.topology_mq_warnCount = data.count;
                }
                else
                    $scope.topology_mq_warnCount = 0;
            });
        };
        //图表
        var chart_warn = null;
        var chart_warn_options = {
            animation: false,
            title: {
                text: '实时监控',
                subtext: ''
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['延迟', '失败', '延迟并失败', '不完整']
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
            xAxis: [{
                type: 'time'
            }],
            yAxis: [{
                type: 'value',
                splitNumber: 5,
                scale: true,
                max: 5000
            }],
            series: [{
                name: '延迟',
                type: 'scatter',
                symbolSize: function (value) {
                    return 5;
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: function (params) {
                        var date = new Date(params.value[0]);
                        return params.seriesName
                            + ' （'
                            + date.Format("yyyy-MM-dd hh:mm:ss")
                            + '）<br/>'
                            + '时延: ' + params.value[1] + ' ms<br/>'
                            + '协议: ' + params.value[2] + '<br/> '
                            + '源IP: ' + params.value[3] + '<br/>'
                            + '目的IP: ' + params.value[4] + '<br/>';
                    },
                    //axisPointer: {
                    //    type: 'cross',
                    //    lineStyle: {
                    //        type: 'dashed',
                    //        width: 1
                    //    }
                    //}
                },
                data: $scope.warnTimeLine_warnS2
            }, {
                name: '失败',
                type: 'scatter',
                symbolSize: function (value) {
                    return 5;
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: function (params) {
                        var date = new Date(params.value[0]);
                        return params.seriesName
                            + ' （'
                            + date.Format("yyyy-MM-dd hh:mm:ss")
                            + '）<br/>'
                            + '时延: ' + params.value[1] + ' ms<br/>'
                            + '协议: ' + params.value[2] + '<br/> '
                            + '源IP: ' + params.value[3] + '<br/>'
                            + '目的IP: ' + params.value[4] + '<br/>';
                    },
                    //axisPointer: {
                    //    type: 'cross',
                    //    lineStyle: {
                    //        type: 'dashed',
                    //        width: 1
                    //    }
                    //}
                },
                data: $scope.warnTimeLine_warnS3
            }, {
                name: '延迟并失败',
                type: 'scatter',
                symbolSize: function (value) {
                    return 5;
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: function (params) {
                        var date = new Date(params.value[0]);
                        return params.seriesName
                            + ' （'
                            + date.Format("yyyy-MM-dd hh:mm:ss")
                            + '）<br/>'
                            + '时延: ' + params.value[1] + ' ms<br/>'
                            + '协议: ' + params.value[2] + '<br/> '
                            + '源IP: ' + params.value[3] + '<br/>'
                            + '目的IP: ' + params.value[4] + '<br/>';
                    },
                    //axisPointer: {
                    //    type: 'cross',
                    //    lineStyle: {
                    //        type: 'dashed',
                    //        width: 1
                    //    }
                    //}
                },
                data: $scope.warnTimeLine_warnS1
            }, {
                name: '不完整',
                type: 'scatter',
                symbolSize: function (value) {
                    return 5;
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: function (params) {
                        var date = new Date(params.value[0]);
                        return params.seriesName
                            + ' （'
                            + date.Format("yyyy-MM-dd hh:mm:ss")
                            + '）<br/>'
                            + '时延: ' + params.value[1] + ' ms<br/>'
                            + '协议: ' + params.value[2] + '<br/> '
                            + '源IP: ' + params.value[3] + '<br/>'
                            + '目的IP: ' + params.value[4] + '<br/>';
                    },
                    //axisPointer: {
                    //    type: 'cross',
                    //    lineStyle: {
                    //        type: 'dashed',
                    //        width: 1
                    //    }
                    //}
                },
                data: $scope.warnTimeLine_warnS7
            }]
        };
        var chart_http = null;
        var chart_http_options = {
            tooltip: {
                formatter: "{a} <br/>{c} {b}"
            },
            toolbox: {
                show: true
            },
            series: [{
                name: '响应率',
                type: 'gauge',
                //min: 0,
                //max: 100,
                radius: '85%',
                splitNumber: 5,
                axisLine: {            // 坐标轴线
                    lineStyle: {       // 属性lineStyle控制线条样式
                        width: 10
                    }
                },
                axisTick: {            // 坐标轴小标记
                    length: 15,        // 属性length控制线长
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: 'auto'
                    }
                },
                splitLine: {           // 分隔线
                    length: 20,         // 属性length控制线长
                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                        color: 'auto'
                    }
                },
                title: {
                    textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                        fontWeight: 'bolder',
                        fontSize: 12,
                        fontStyle: 'normal',
                    }
                },
                detail: {
                    textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                        fontWeight: 'bolder'
                    }
                },
                data: [{ value: 0, name: '响应率' }]
            }, {
                name: '成功率',
                type: 'gauge',
                center: ['25%', '50%'],    // 默认全局居中
                radius: '90%',
                //min: 0,
                //max: 100,
                endAngle: 45,
                splitNumber: 5,
                axisLine: {            // 坐标轴线
                    lineStyle: {       // 属性lineStyle控制线条样式
                        width: 8
                    }
                },
                axisTick: {            // 坐标轴小标记
                    length: 12,        // 属性length控制线长
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: 'auto'
                    }
                },
                splitLine: {           // 分隔线
                    length: 20,         // 属性length控制线长
                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                        color: 'auto'
                    }
                },
                pointer: {
                    width: 5
                },
                title: {
                    offsetCenter: [0, '-30%'],       // x, y，单位px
                },
                detail:
                {
                    textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                        fontWeight: 'bolder'
                    }
                },
                data: [{ value: 0, name: '成功率' }]
            }]
        };
        var chart_8583 = null;
        var chart_8583_options = {
            tooltip: {
                formatter: "{a} <br/>{c} {b}"
            },
            toolbox: {
                show: true
            },
            series: [{
                name: '响应率',
                type: 'gauge',
                //min: 0,
                //max: 100,
                radius: '85%',
                splitNumber: 5,
                axisLine: {            // 坐标轴线
                    lineStyle: {       // 属性lineStyle控制线条样式
                        width: 10
                    }
                },
                axisTick: {            // 坐标轴小标记
                    length: 15,        // 属性length控制线长
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: 'auto'
                    }
                },
                splitLine: {           // 分隔线
                    length: 20,         // 属性length控制线长
                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                        color: 'auto'
                    }
                },
                title: {
                    textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                        fontWeight: 'bolder',
                        fontSize: 12,
                        fontStyle: 'normal',
                    }
                },
                detail: {
                    textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                        fontWeight: 'bolder'
                    }
                },
                data: [{ value: 0, name: '响应率' }]
            }, {
                name: '成功率',
                type: 'gauge',
                center: ['25%', '50%'],    // 默认全局居中
                radius: '90%',
                //min: 0,
                //max: 100,
                endAngle: 45,
                splitNumber: 5,
                axisLine: {            // 坐标轴线
                    lineStyle: {       // 属性lineStyle控制线条样式
                        width: 8
                    }
                },
                axisTick: {            // 坐标轴小标记
                    length: 12,        // 属性length控制线长
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: 'auto'
                    }
                },
                splitLine: {           // 分隔线
                    length: 20,         // 属性length控制线长
                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                        color: 'auto'
                    }
                },
                pointer: {
                    width: 5
                },
                title: {
                    offsetCenter: [0, '-30%'],       // x, y，单位px
                },
                detail:
                {
                    textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                        fontWeight: 'bolder'
                    }
                },
                data: [{ value: 0, name: '成功率' }]
            }]
        };
        var chart_20022 = null;
        var chart_20022_options = {
            tooltip: {
                formatter: "{a} <br/>{c} {b}"
            },
            toolbox: {
                show: true
            },
            series: [{
                name: '响应率',
                type: 'gauge',
                //min: 0,
                //max: 100,
                radius: '85%',
                splitNumber: 5,
                axisLine: {            // 坐标轴线
                    lineStyle: {       // 属性lineStyle控制线条样式
                        width: 10
                    }
                },
                axisTick: {            // 坐标轴小标记
                    length: 15,        // 属性length控制线长
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: 'auto'
                    }
                },
                splitLine: {           // 分隔线
                    length: 20,         // 属性length控制线长
                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                        color: 'auto'
                    }
                },
                title: {
                    textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                        fontWeight: 'bolder',
                        fontSize: 12,
                        fontStyle: 'normal',
                    }
                },
                detail: {
                    textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                        fontWeight: 'bolder'
                    }
                },
                data: [{ value: 0, name: '响应率' }]
            }, {
                name: '成功率',
                type: 'gauge',
                center: ['25%', '50%'],    // 默认全局居中
                radius: '90%',
                //min: 0,
                //max: 100,
                endAngle: 45,
                splitNumber: 5,
                axisLine: {            // 坐标轴线
                    lineStyle: {       // 属性lineStyle控制线条样式
                        width: 8
                    }
                },
                axisTick: {            // 坐标轴小标记
                    length: 12,        // 属性length控制线长
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: 'auto'
                    }
                },
                splitLine: {           // 分隔线
                    length: 20,         // 属性length控制线长
                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                        color: 'auto'
                    }
                },
                pointer: {
                    width: 5
                },
                title: {
                    offsetCenter: [0, '-30%'],       // x, y，单位px
                },
                detail:
                {
                    textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                        fontWeight: 'bolder'
                    }
                },
                data: [{ value: 0, name: '成功率' }]
            }]
        };
        var chart_mq = null;
        var chart_mq_options = {
            tooltip: {
                formatter: "{a} <br/>{c} {b}"
            },
            toolbox: {
                show: true
            },
            series: [{
                name: '响应率',
                type: 'gauge',
                //min: 0,
                //max: 100,
                radius: '85%',
                splitNumber: 5,
                axisLine: {            // 坐标轴线
                    lineStyle: {       // 属性lineStyle控制线条样式
                        width: 10
                    }
                },
                axisTick: {            // 坐标轴小标记
                    length: 15,        // 属性length控制线长
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: 'auto'
                    }
                },
                splitLine: {           // 分隔线
                    length: 20,         // 属性length控制线长
                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                        color: 'auto'
                    }
                },
                title: {
                    textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                        fontWeight: 'bolder',
                        fontSize: 12,
                        fontStyle: 'normal',
                    }
                },
                detail: {
                    textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                        fontWeight: 'bolder'
                    }
                },
                data: [{ value: 0, name: '响应率' }]
            }, {
                name: '成功率',
                type: 'gauge',
                center: ['25%', '50%'],    // 默认全局居中
                radius: '90%',
                //min: 0,
                //max: 100,
                endAngle: 45,
                splitNumber: 5,
                axisLine: {            // 坐标轴线
                    lineStyle: {       // 属性lineStyle控制线条样式
                        width: 8
                    }
                },
                axisTick: {            // 坐标轴小标记
                    length: 12,        // 属性length控制线长
                    lineStyle: {       // 属性lineStyle控制线条样式
                        color: 'auto'
                    }
                },
                splitLine: {           // 分隔线
                    length: 20,         // 属性length控制线长
                    lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                        color: 'auto'
                    }
                },
                pointer: {
                    width: 5
                },
                title: {
                    offsetCenter: [0, '-30%'],       // x, y，单位px
                },
                detail:
                {
                    textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                        fontWeight: 'bolder'
                    }
                },
                data: [{ value: 0, name: '成功率' }]
            }]
        };
        $scope.$watch(function () {
            var r = null;
            if ($scope.warnTimeLine_warnS2 && $scope.warnTimeLine_warnS2.length) {
                _.forEach($scope.warnTimeLine_warnS2, function (warn) {
                    r += warn.warnTime.getTime();
                });
            }
            return r;
        }, function () {
            if (chart_warn) {
                //chart_warn_options.series.data = $scope.warnTimeLine_warnList
                //chart_warn.setOption(chart_warn_options, true);
                chart_warn.setSeries(chart_warn_options.series, true);
            }
        });
        $scope.$watch(function () {
            return $scope.topology_http_successRatio + "" + $scope.topology_http_responseRatio;
        }, function () {
            chart_http_options.series[0].data[0].value = $scope.topology_http_responseRatio;
            chart_http_options.series[1].data[0].value = $scope.topology_http_successRatio;
            if (chart_http)
                chart_http.setOption(chart_http_options, true);
        });
        $scope.$watch(function () {
            return $scope.topology_8583_successRatio + "" + $scope.topology_8583_responseRatio;
        }, function () {
            chart_8583_options.series[0].data[0].value = $scope.topology_8583_responseRatio;
            chart_8583_options.series[1].data[0].value = $scope.topology_8583_successRatio;
            if (chart_8583)
                chart_8583.setOption(chart_8583_options, true);
        });
        $scope.$watch(function () {
            return $scope.topology_20022_successRatio + "" + $scope.topology_20022_responseRatio;
        }, function () {
            chart_20022_options.series[0].data[0].value = $scope.topology_20022_responseRatio;
            chart_20022_options.series[1].data[0].value = $scope.topology_20022_successRatio;
            if (chart_20022)
                chart_20022.setOption(chart_20022_options, true);
        });
        $scope.$watch(function () {
            return $scope.topology_mq_successRatio + "" + $scope.topology_mq_responseRatio;
        }, function () {
            chart_mq_options.series[0].data[0].value = $scope.topology_mq_responseRatio;
            chart_mq_options.series[1].data[0].value = $scope.topology_mq_successRatio;
            if (chart_mq)
                chart_mq.setOption(chart_mq_options, true);
        });
        //窗口调整时更新图表大小
        var windowResize = function () {
            if (chart_warn)
                chart_warn.resize();
        };
        $($window).off("resize.index").on("resize.index", windowResize).trigger("resize.index");
        //离开该页事件
        $scope.$on("$routeChangeStart", function () {
            $($window).off("resize.index");
            warningSocketService.off("onmessage.indexWarnTimeLine");
            $interval.cancel(warnTimeLineTimer);
            $interval.cancel(topologyTimer);
        });
        //执行初始化
        $scope.init();
    });
});