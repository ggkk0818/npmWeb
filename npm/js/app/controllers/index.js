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
        $scope.topology_8583_count = 1609;
        $scope.topology_8583_duration = 481.5;
        $scope.topology_8583_successRatio = 95;
        $scope.topology_8583_responseRatio = 99;
        $scope.topology_8583_warnCount = 2;
        $scope.topology_8583_flow = 65;
        $scope.topology_8583_flowSuffix = "M";
        $scope.topology_8583_deviceList = [
            {srcip: "192.168.200.20", dstip: "192.168.200.22", allflow: "30.43MB", count: 785, warnCount: 1},
            {srcip: "192.168.200.21", dstip: "192.168.200.22", allflow: "34.57MB", count: 824, warnCount: 1}
        ];
        $scope.topology_20022_count = 812;
        $scope.topology_20022_duration = 338;
        $scope.topology_20022_successRatio = 100;
        $scope.topology_20022_responseRatio = 100;
        $scope.topology_20022_warnCount = 0;
        $scope.topology_20022_flow = 33;
        $scope.topology_20022_flowSuffix = "M";
        $scope.topology_20022_deviceList = [
            {srcip: "192.168.200.20", dstip: "192.168.200.23", allflow: "18MB", count: 412, warnCount: 0},
            {srcip: "192.168.200.21", dstip: "192.168.200.23", allflow: "15MB", count: 400, warnCount: 0}
        ];
        $scope.topology_http_count = 1745;
        $scope.topology_http_duration = 251;
        $scope.topology_http_successRatio = 98;
        $scope.topology_http_responseRatio = 99;
        $scope.topology_http_warnCount = 0;
        $scope.topology_http_flow = 291;
        $scope.topology_http_flowSuffix = "M";
        $scope.topology_http_deviceList = [
            {srcip: "192.168.200.20", dstip: "192.168.200.24", allflow: "130MB", count: 695, warnCount: 0},
            {srcip: "192.168.200.21", dstip: "192.168.200.24", allflow: "161MB", count: 1050, warnCount: 0}
        ];
        $scope.topology_mysql_count = 0;
        $scope.topology_mysql_duration = 0;
        $scope.topology_mysql_successRatio = 0;
        $scope.topology_mysql_responseRatio = 0;
        $scope.topology_mysql_warnCount = 0;
        $scope.topology_mysql_flow = 0;
        $scope.topology_mysql_flowSuffix = "M";
        $scope.topology_mysql_deviceList = null;
        //初始化
        $scope.init = function () {
            //告警时间线
            var now = new Date();
            for (var i = $scope.warnTimeLine_size; i >= 0; i--) {
                var time = new Date(now.getTime() - $scope.warnTimeLine_interval * i * 1000);
                var data = {warnTime: time, value: [time, "-",]};
                $scope.warnTimeLine_warnS0.push(data);
                //$scope.warnTimeLine_warnS1.push(data);
                //$scope.warnTimeLine_warnS2.push(data);
                //$scope.warnTimeLine_warnS3.push(data);

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
                        if (typeof status === "number" && $scope["warnTimeLine_warnS" + status]) {
                            $scope["warnTimeLine_warnS" + status].push(warn);
                        }
                        //if (status == 0) {
                        //    $scope.warnTimeLine_warnS0.push(warn);
                        //} else if (status == 1) {
                        //    $scope.warnTimeLine_warnS1.push(warn);
                        //} else if (status == 2) {
                        //    $scope.warnTimeLine_warnS2.push(warn);
                        //} else if (status == 3) {
                        //    $scope.warnTimeLine_warnS3.push(warn);
                        //} else if (status == 6) {
                        //    $scope.warnTimeLine_warnS6.push(warn);
                        //} else if (status == 7) {
                        //    $scope.warnTimeLine_warnS7.push(warn);
                        //}

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
            //warningService.list({
            //    type: "iso20022",
            //    startWarnTime: warnQueryStartTime,
            //    start: 0,
            //    limit: 0
            //}, function (data) {
            //    warnQueryDone(data, "iso20022");
            //});
            //warningService.list({type: "http", startWarnTime: warnQueryStartTime, start: 0, limit: 0}, function (data) {
            //    warnQueryDone(data, "http");
            //});
            //warningService.list({
            //    type: "mysql",
            //    startWarnTime: warnQueryStartTime,
            //    start: 0,
            //    limit: 0
            //}, function (data) {
            //    warnQueryDone(data, "mysql");
            //});

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
                            if (typeof status === "number" && $scope["warnTimeLine_warnS" + status]) {
                                $scope["warnTimeLine_warnS" + status].push(warn);
                            }
                            //if (status == 0) {
                            //    $scope.warnTimeLine_warnS0.push(warn);
                            //} else if (status == 1) {
                            //    $scope.warnTimeLine_warnS1.push(warn);
                            //} else if (status == 2) {
                            //    $scope.warnTimeLine_warnS2.push(warn);
                            //} else if (status == 3) {
                            //    $scope.warnTimeLine_warnS3.push(warn);
                            //} else if (status == 6) {
                            //    $scope.warnTimeLine_warnS6.push(warn);
                            //} else if (status == 7) {
                            //    $scope.warnTimeLine_warnS7.push(warn);
                            //}
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
                chart_warn = echarts.init($("#index_chart_warn")[0]);
                chart_warn.setOption(chart_warn_options);
                chart_http = echarts.init($("#index_chart_http")[0], "blue");
                chart_http.setOption(chart_http_options);
                chart_8583 = echarts.init($("#index_chart_8583")[0], "blue");
                chart_8583.setOption(chart_8583_options);
                chart_20022 = echarts.init($("#index_chart_20022")[0], "blue");
                chart_20022.setOption(chart_20022_options);
                chart_mysql = echarts.init($("#index_chart_mysql")[0], "blue");
                chart_mysql.setOption(chart_mysql_options);
            });


        };
        //告警时间线增加块
        var warnTimeLineTimer = null;
        var warnTimeLineTimerTick = function () {
            var now = new Date();
            var allWarn = [$scope.warnTimeLine_warnS0,
                $scope.warnTimeLine_warnS1,
                $scope.warnTimeLine_warnS2,
                $scope.warnTimeLine_warnS3,
                $scope.warnTimeLine_warnS6,
                $scope.warnTimeLine_warnS7];
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

            $scope.warnTimeLine_warnS0.push({warnTime: now, value: [now, "-", "-"]});
            //$scope.warnTimeLine_warnS1.push({warnTime: now, value: [now, "-", "-"]});
            //$scope.warnTimeLine_warnS2.push({warnTime: now, value: [now, "-", "-"]});
            //$scope.warnTimeLine_warnS3.push({warnTime: now, value: [now, "-", "-"]});
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
            $scope.topology_startTime = "2014-03-31 12:00:00";
            $scope.topology_endTime = "2016-03-31 13:00:00";
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
                        $scope.topology_8583_successRatio = row.count > 0 ? Math.round(row.scount * 10000 / row.count) / 100 : 0;
                        $scope.topology_8583_responseRatio = row.count > 0 ? Math.round(row.rcount * 10000 / row.count) / 100 : 0;
                        if (typeof row.allflow === "number") {
                            var flow = numeral(row.allflow).format("0b");
                            $scope.topology_8583_flow = /\d+/.exec(flow)[0];
                            $scope.topology_8583_flowSuffix = /[a-zA-Z]+/.exec(flow)[0];
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
                        $scope.topology_20022_successRatio = row.count > 0 ? Math.round(row.scount * 10000 / row.count) / 100 : 0;
                        $scope.topology_20022_responseRatio = row.count > 0 ? Math.round(row.rcount * 10000 / row.count) / 100 : 0;
                        if (typeof row.allflow === "number") {
                            var flow = numeral(row.allflow).format("0b");
                            $scope.topology_20022_flow = /\d+/.exec(flow)[0];
                            $scope.topology_20022_flowSuffix = /[a-zA-Z]+/.exec(flow)[0];
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
                        $scope.topology_http_successRatio = row.count > 0 ? Math.round(row.scount * 10000 / row.count) / 100 : 0;
                        $scope.topology_http_responseRatio = row.count > 0 ? Math.round(row.rcount * 10000 / row.count) / 100 : 0;
                        if (typeof row.allflow === "number") {
                            var flow = numeral(row.allflow).format("0b");
                            $scope.topology_http_flow = /\d+/.exec(flow)[0];
                            $scope.topology_http_flowSuffix = /[a-zA-Z]+/.exec(flow)[0];
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
                        $scope.topology_mysql_successRatio = row.count > 0 ? Math.round(row.scount * 10000 / row.count) / 100 : 0;
                        $scope.topology_mysql_responseRatio = row.count > 0 ? Math.round(row.rcount * 10000 / row.count) / 100 : 0;

                        if (typeof row.allflow === "number") {
                            var flow = numeral(row.allflow).format("0b");
                            $scope.topology_mysql_flow = /\d+/.exec(flow)[0];
                            $scope.topology_mysql_flowSuffix = /[a-zA-Z]+/.exec(flow)[0];
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
        };
        //图表
        var chart_warn = null;
        var chart_warn_options = {
            animation: false,
            title: {
                text: '告警'
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['status0', 'status1', 'status2', 'status3', 'status6', 'status7']
            },
            //dataRange: {
            //    min: 0,
            //    max: 7,
            //    orient: 'horizontal',
            //    y: 30,
            //    x: 'center',
            //    //text:['高','低'],           // 文本，默认为数值文本
            //    color: ['lightgreen', 'orange'],
            //    splitNumber: 8
            //},
            toolbox: {
                show: true,
                feature: {
                    mark: {show: true},
                    dataView: {show: true, readOnly: false},
                    restore: {show: true},
                    saveAsImage: {show: true}
                }
            },
            //dataZoom: {
            //    show: true,
            //    start : 30,
            //    end : 70
            //},
            xAxis: [
                {
                    type: 'time'
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    splitNumber: 5,
                    scale: true
                }
            ],
            series: [{
                name: 'status0',
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
                            + date.getFullYear() + '-'
                            + (date.getMonth() + 1) + '-'
                            + date.getDate() + ' '
                            + date.getHours() + ':'
                            + date.getMinutes()
                            + '）<br/>'
                            + '时延: ' + params.value[1] + ' ms<br/>'
                            + '协议: ' + params.value[2] + '<br/> '
                            + '源IP: ' + params.value[3] + '<br/>'
                            + '目的IP: ' + params.value[4] + '<br/>';
                    },
                    axisPointer: {
                        type: 'cross',
                        lineStyle: {
                            type: 'dashed',
                            width: 1
                        }
                    }
                },
                data: $scope.warnTimeLine_warnS0
            }, {
                name: 'status1',
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
                            + date.getFullYear() + '-'
                            + (date.getMonth() + 1) + '-'
                            + date.getDate() + ' '
                            + date.getHours() + ':'
                            + date.getMinutes()
                            + '）<br/>'
                            + '时延: ' + params.value[1] + ' ms<br/>'
                            + '协议: ' + params.value[2] + '<br/> '
                            + '源IP: ' + params.value[3] + '<br/>'
                            + '目的IP: ' + params.value[4] + '<br/>';
                    },
                    axisPointer: {
                        type: 'cross',
                        lineStyle: {
                            type: 'dashed',
                            width: 1
                        }
                    }
                },
                data: $scope.warnTimeLine_warnS1
            }, {
                name: 'status2',
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
                            + date.getFullYear() + '-'
                            + (date.getMonth() + 1) + '-'
                            + date.getDate() + ' '
                            + date.getHours() + ':'
                            + date.getMinutes()
                            + '）<br/>'
                            + '时延: ' + params.value[1] + ' ms<br/>'
                            + '协议: ' + params.value[2] + '<br/> '
                            + '源IP: ' + params.value[3] + '<br/>'
                            + '目的IP: ' + params.value[4] + '<br/>';
                    },
                    axisPointer: {
                        type: 'cross',
                        lineStyle: {
                            type: 'dashed',
                            width: 1
                        }
                    }
                },
                data: $scope.warnTimeLine_warnS2
            }, {
                name: 'status3',
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
                            + date.getFullYear() + '-'
                            + (date.getMonth() + 1) + '-'
                            + date.getDate() + ' '
                            + date.getHours() + ':'
                            + date.getMinutes()
                            + '）<br/>'
                            + '时延: ' + params.value[1] + ' ms<br/>'
                            + '协议: ' + params.value[2] + '<br/> '
                            + '源IP: ' + params.value[3] + '<br/>'
                            + '目的IP: ' + params.value[4] + '<br/>';
                    },
                    axisPointer: {
                        type: 'cross',
                        lineStyle: {
                            type: 'dashed',
                            width: 1
                        }
                    }
                },
                data: $scope.warnTimeLine_warnS3
            }, {
                name: 'status6',
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
                            + date.getFullYear() + '-'
                            + (date.getMonth() + 1) + '-'
                            + date.getDate() + ' '
                            + date.getHours() + ':'
                            + date.getMinutes()
                            + '）<br/>'
                            + '时延: ' + params.value[1] + ' ms<br/>'
                            + '协议: ' + params.value[2] + '<br/> '
                            + '源IP: ' + params.value[3] + '<br/>'
                            + '目的IP: ' + params.value[4] + '<br/>';
                    },
                    axisPointer: {
                        type: 'cross',
                        lineStyle: {
                            type: 'dashed',
                            width: 1
                        }
                    }
                },
                data: $scope.warnTimeLine_warnS6
            }, {
                name: 'status7',
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
                            + date.getFullYear() + '-'
                            + (date.getMonth() + 1) + '-'
                            + date.getDate() + ' '
                            + date.getHours() + ':'
                            + date.getMinutes()
                            + '）<br/>'
                            + '时延: ' + params.value[1] + ' ms<br/>'
                            + '协议: ' + params.value[2] + '<br/> '
                            + '源IP: ' + params.value[3] + '<br/>'
                            + '目的IP: ' + params.value[4] + '<br/>';
                    },
                    axisPointer: {
                        type: 'cross',
                        lineStyle: {
                            type: 'dashed',
                            width: 1
                        }
                    }
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
            series: [
                {
                    name: '响应率',
                    type: 'gauge',
                    min: 0,
                    max: 100,
                    splitNumber: 10,
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
                            fontSize: 20,
                            fontStyle: 'italic'
                        }
                    },
                    detail: {
                        textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                            fontWeight: 'bolder'
                        }
                    },
                    data: [{value: 0, name: ''}]
                },
                {
                    name: '成功率',
                    type: 'gauge',
                    center: ['25%', '55%'],    // 默认全局居中
                    radius: '80%',
                    min: 0,
                    max: 100,
                    endAngle: 45,
                    splitNumber: 10,
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
                        offsetCenter: [0, '-30%']      // x, y，单位px
                    },
                    detail: {
                        textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                            fontWeight: 'bolder'
                        }
                    },
                    data: [{value: 0, name: ''}]
                },
            ]
        };
        var chart_8583 = null;
        var chart_8583_options = {
            tooltip: {
                formatter: "{a} <br/>{c} {b}"
            },
            toolbox: {
                show: true
            },
            series: [
                {
                    name: '响应率',
                    type: 'gauge',
                    min: 0,
                    max: 100,
                    splitNumber: 10,
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
                            fontSize: 20,
                            fontStyle: 'italic'
                        }
                    },
                    detail: {
                        textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                            fontWeight: 'bolder'
                        }
                    },
                    data: [{value: 0, name: ''}]
                },
                {
                    name: '成功率',
                    type: 'gauge',
                    center: ['25%', '55%'],    // 默认全局居中
                    radius: '80%',
                    min: 0,
                    max: 100,
                    endAngle: 45,
                    splitNumber: 10,
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
                        offsetCenter: [0, '-30%']     // x, y，单位px
                    },
                    detail: {
                        textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                            fontWeight: 'bolder'
                        }
                    },
                    data: [{value: 0, name: ''}]
                },
            ]
        };
        var chart_20022 = null;
        var chart_20022_options = {
            tooltip: {
                formatter: "{a} <br/>{c} {b}"
            },
            toolbox: {
                show: true
            },
            series: [
                {
                    name: '响应率',
                    type: 'gauge',
                    min: 0,
                    max: 100,
                    splitNumber: 10,
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
                            fontSize: 20,
                            fontStyle: 'italic'
                        }
                    },
                    detail: {
                        textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                            fontWeight: 'bolder'
                        }
                    },
                    data: [{value: 0, name: ''}]
                },
                {
                    name: '成功率',
                    type: 'gauge',
                    center: ['25%', '55%'],    // 默认全局居中
                    radius: '80%',
                    min: 0,
                    max: 100,
                    endAngle: 45,
                    splitNumber: 10,
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
                        offsetCenter: [0, '-30%']      // x, y，单位px
                    },
                    detail: {
                        textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                            fontWeight: 'bolder'
                        }
                    },
                    data: [{value: 0, name: ''}]
                },
            ]
        };
        var chart_mysql = null;
        var chart_mysql_options = {
            tooltip: {
                formatter: "{a} <br/>{c} {b}"
            },
            toolbox: {
                show: true
            },
            series: [
                {
                    name: '响应率',
                    type: 'gauge',
                    min: 0,
                    max: 100,
                    splitNumber: 10,
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
                            fontSize: 20,
                            fontStyle: 'italic'
                        }
                    },
                    detail: {
                        textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                            fontWeight: 'bolder'
                        }
                    },
                    data: [{value: 0, name: ''}]
                },
                {
                    name: '成功率',
                    type: 'gauge',
                    center: ['25%', '55%'],    // 默认全局居中
                    radius: '80%',
                    min: 0,
                    max: 100,
                    endAngle: 45,
                    splitNumber: 10,
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
                        offsetCenter: [0, '-30%']       // x, y，单位px
                    },
                    detail: {
                        textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                            fontWeight: 'bolder'
                        }
                    },
                    data: [{value: 0, name: ''}]
                },
            ]
        };
        $scope.$watch(function () {
            var r = null;
            if ($scope.warnTimeLine_warnS0 && $scope.warnTimeLine_warnS0.length) {
                _.forEach($scope.warnTimeLine_warnS0, function (warn) {
                    r += warn.warnTime.getTime();
                });
            }

            return r;
        }, function () {
            if (chart_warn) {
                //chart_warn_options.series.data = $scope.warnTimeLine_warnList
                //chart_warn.setOption(chart_warn_options);
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
            return $scope.topology_mysql_successRatio + "" + $scope.topology_mysql_responseRatio;
        }, function () {
            chart_mysql_options.series[0].data[0].value = $scope.topology_mysql_responseRatio;
            chart_mysql_options.series[1].data[0].value = $scope.topology_mysql_successRatio;
            if (chart_mysql)
                chart_mysql.setOption(chart_mysql_options, true);
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