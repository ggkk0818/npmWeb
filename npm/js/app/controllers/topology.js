define(['angular', 'lodash', 'jquery', 'services/all'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('TopologyCtrl', function ($rootScope, $scope, $route, $interval, $location, $timeout, $window, logService, statisticService, warningService, warningSocketService) {
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
            { srcip: "192.168.200.20", dstip: "192.168.200.22", allflow: "30.43MB", count: 785, warnCount: 1 },
            { srcip: "192.168.200.21", dstip: "192.168.200.22", allflow: "34.57MB", count: 824, warnCount: 1 }
        ];
        $scope.topology_20022_count = 812;
        $scope.topology_20022_duration = 338;
        $scope.topology_20022_successRatio = 100;
        $scope.topology_20022_responseRatio = 100;
        $scope.topology_20022_warnCount = 0;
        $scope.topology_20022_flow = 33;
        $scope.topology_20022_flowSuffix = "M";
        $scope.topology_20022_deviceList = [
            { srcip: "192.168.200.20", dstip: "192.168.200.23", allflow: "18MB", count: 412, warnCount: 0 },
            { srcip: "192.168.200.21", dstip: "192.168.200.23", allflow: "15MB", count: 400, warnCount: 0 }
        ];
        $scope.topology_http_count = 1745;
        $scope.topology_http_duration = 251;
        $scope.topology_http_successRatio = 98;
        $scope.topology_http_responseRatio = 99;
        $scope.topology_http_warnCount = 0;
        $scope.topology_http_flow = 291;
        $scope.topology_http_flowSuffix = "M";
        $scope.topology_http_deviceList = [
            { srcip: "192.168.200.20", dstip: "192.168.200.24", allflow: "130MB", count: 695, warnCount: 0 },
            { srcip: "192.168.200.21", dstip: "192.168.200.24", allflow: "161MB", count: 1050, warnCount: 0 }
        ];
        $scope.topology_mysql_count = 0;
        $scope.topology_mysql_duration = 0;
        $scope.topology_mysql_successRatio = 0;
        $scope.topology_mysql_responseRatio = 0;
        $scope.topology_mysql_warnCount = 0;
        $scope.topology_mysql_flow = 0;
        $scope.topology_mysql_flowSuffix = "M";
        $scope.topology_mysql_deviceList = null;
        $scope.topology_mq_count = 0;
        $scope.topology_mq_duration = 0;
        $scope.topology_mq_successRatio = 0;
        $scope.topology_mq_responseRatio = 0;
        $scope.topology_mq_warnCount = 0;
        $scope.topology_mq_flow = 0;
        $scope.topology_mq_flowSuffix = "M";
        $scope.topology_mq_deviceList = null;
        //初始化
        $scope.init = function () {
            //拓扑图查询
            $scope.topology_query();
            topologyTimer = $interval($scope.topology_query, 5000);
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
                        $scope.topology_mq_successRatio = row.count > 0 ? Math.round(row.scount * 10000 / row.count) / 100 : 0;
                        $scope.topology_mq_responseRatio = row.count > 0 ? Math.round(row.rcount * 10000 / row.count) / 100 : 0;

                        if (typeof row.allflow === "number") {
                            var flow = numeral(row.allflow).format("0b");
                            $scope.topology_mq_flow = /\d+/.exec(flow)[0];
                            $scope.topology_mq_flowSuffix = /[a-zA-Z]+/.exec(flow)[0];
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
        //离开该页事件
        $scope.$on("$routeChangeStart", function () {
            $interval.cancel(topologyTimer);
        });
        //执行初始化
        $scope.init();
    });
});