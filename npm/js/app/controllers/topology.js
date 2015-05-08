define(['angular', 'lodash', 'jquery', 'services/all'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('TopologyCtrl', function ($rootScope, $scope, $route, $interval, $location, $timeout, $window, logService, statisticService, warningService, warningSocketService) {
        //拓扑图变量
        $scope.PROTOCOL_20022_TYPE = ["HVPS", "BEPS", "ECDS", "IBPS"];
        $scope.topology_startTime = null;
        $scope.topology_endTime = null;
        $scope.topology_8583left_count = 0;
        $scope.topology_8583left_duration = 0;
        $scope.topology_8583left_successRatio = 0;
        $scope.topology_8583left_responseRatio = 0;
        $scope.topology_8583left_warnCount = 0;
        $scope.topology_8583left_flow = 0;
        $scope.topology_8583left_flowSuffix = "M";
        $scope.topology_8583left_deviceList = null;
        $scope.topology_8583right_count = 0;
        $scope.topology_8583right_duration = 0;
        $scope.topology_8583right_successRatio = 0;
        $scope.topology_8583right_responseRatio = 0;
        $scope.topology_8583right_warnCount = 0;
        $scope.topology_8583right_flow = 0;
        $scope.topology_8583right_flowSuffix = "M";
        $scope.topology_8583right_deviceList = null;
        $scope.topology_20022_count = {};
        $scope.topology_20022_duration = {};
        $scope.topology_20022_successRatio = {};
        $scope.topology_20022_responseRatio = {};
        $scope.topology_20022_warnCount = {};
        $scope.topology_20022_flow = {};
        $scope.topology_20022_flowSuffix = {};
        $scope.topology_20022_deviceList = {};
        $scope.topology_http_count = 0;
        $scope.topology_http_duration = 0;
        $scope.topology_http_successRatio = 0;
        $scope.topology_http_responseRatio = 0;
        $scope.topology_http_warnCount = 0;
        $scope.topology_http_flow = 0;
        $scope.topology_http_flowSuffix = "M";
        $scope.topology_http_deviceList = null;
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
        //弹出框变量
        $scope.topology_modal_title = null;
        $scope.topology_modal_deviceList = null;
        //初始化
        $scope.init = function () {
            //拓扑图查询
            $scope.topology_query();
            topologyTimer = $interval($scope.topology_query, 60000);
        };
        //查询拓扑图数据
        var topologyTimer = null;
        $scope.topology_query = function () {
            $scope.topology_startTime = "2015-02-09 11:53:00";
            $scope.topology_endTime = "2015-02-09 11:54:00";
            var sortFunc = function (a, b) {
                var val1 = a.count || 0;
                var val2 = b.count || 0;
                return val1 > val2 ? -1 : val1 < val2 ? 1 : 0;
            };
            // 8583left
            statisticService.showTopology({
                type: "8583",
                unionpayFront: "left",
                starttime: $scope.topology_startTime,
                endtime: $scope.topology_endTime
            }, function (data) {
                if (data && data.state == "200") {
                    if (data.data && data.data.length) {
                        var row = data.data[0];
                        $scope.topology_8583left_count = row.count || 0;
                        $scope.topology_8583left_duration = row.maxDuration || 0;
                        $scope.topology_8583left_successRatio = row.count > 0 && row.scount > 0 ? Math.round(row.scount * 10000 / row.count) / 100 : 0;
                        $scope.topology_8583left_responseRatio = row.count > 0 && row.rcount > 0 ? Math.round(row.rcount * 10000 / row.count) / 100 : 0;
                        if (typeof row.allflow === "number") {
                            var flow = numeral(row.allflow).format("0b");
                            $scope.topology_8583left_flow = /\d+/.exec(flow)[0];
                            $scope.topology_8583left_flowSuffix = /[a-zA-Z]+/.exec(flow)[0];
                        }
                        else {
                            $scope.topology_8583left_flow = 0;
                            $scope.topology_8583left_flowSuffix = "M";
                        }
                    }
                }
            });
            statisticService.showDevice({
                type: "8583",
                unionpayFront: "left",
                starttime: $scope.topology_startTime,
                endtime: $scope.topology_endTime
            }, function (data) {
                if (data && data.state == "200") {
                    data.data = data.data.sort(sortFunc);
                    if (data.data.length > 500)
                        data.data.splice(500);
                    $scope.topology_8583left_deviceList = data.data;
                    for (var i = 0; i < $scope.topology_8583left_deviceList.length; i++) {
                        var record = $scope.topology_8583left_deviceList[i];
                        if (typeof record.allflow === "number") {
                            record.allflow = numeral(record.allflow).format("0b");
                        }
                    }
                    //查询告警信息
                    warningService.showDevice({
                        type: "iso8583",
                        unionpayFront: "left",
                        startWarnTime: $scope.topology_startTime,
                        endWarnTime: $scope.topology_endTime,
                        start: 0,
                        limit: 0
                    }, function (data2) {
                        if (data2 && data2.data) {
                            for (var i = 0; i < data2.data.length; i++) {
                                var warnRecord = data2.data[i];
                                for (var j = 0; j < $scope.topology_8583left_deviceList.length; j++) {
                                    var record = $scope.topology_8583left_deviceList[j];
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
                unionpayFront: "left",
                startWarnTime: $scope.topology_startTime,
                endWarnTime: $scope.topology_endTime,
                start: 0,
                limit: 1
            }, function (data) {
                if (data && data.count) {
                    $scope.topology_8583left_warnCount = data.count;
                }
                else
                    $scope.topology_8583left_warnCount = 0;
            });
            // 8583right
            statisticService.showTopology({
                type: "8583",
                unionpayFront: "right",
                starttime: $scope.topology_startTime,
                endtime: $scope.topology_endTime
            }, function (data) {
                if (data && data.state == "200") {
                    if (data.data && data.data.length) {
                        var row = data.data[0];
                        $scope.topology_8583right_count = row.count || 0;
                        $scope.topology_8583right_duration = row.maxDuration || 0;
                        $scope.topology_8583right_successRatio = row.count > 0 && row.scount > 0 ? Math.round(row.scount * 10000 / row.count) / 100 : 0;
                        $scope.topology_8583right_responseRatio = row.count > 0 && row.rcount > 0 ? Math.round(row.rcount * 10000 / row.count) / 100 : 0;
                        if (typeof row.allflow === "number") {
                            var flow = numeral(row.allflow).format("0b");
                            $scope.topology_8583right_flow = /\d+/.exec(flow)[0];
                            $scope.topology_8583right_flowSuffix = /[a-zA-Z]+/.exec(flow)[0];
                        }
                        else {
                            $scope.topology_8583right_flow = 0;
                            $scope.topology_8583right_flowSuffix = "M";
                        }
                    }
                }
            });
            statisticService.showDevice({
                type: "8583",
                unionpayFront: "right",
                starttime: $scope.topology_startTime,
                endtime: $scope.topology_endTime
            }, function (data) {
                if (data && data.state == "200") {
                    data.data = data.data.sort(sortFunc);
                    if (data.data.length > 500)
                        data.data.splice(500);
                    $scope.topology_8583right_deviceList = data.data;
                    for (var i = 0; i < $scope.topology_8583right_deviceList.length; i++) {
                        var record = $scope.topology_8583right_deviceList[i];
                        if (typeof record.allflow === "number") {
                            record.allflow = numeral(record.allflow).format("0b");
                        }
                    }
                    //查询告警信息
                    warningService.showDevice({
                        type: "iso8583",
                        unionpayFront: "right",
                        startWarnTime: $scope.topology_startTime,
                        endWarnTime: $scope.topology_endTime,
                        start: 0,
                        limit: 0
                    }, function (data2) {
                        if (data2 && data2.data) {
                            for (var i = 0; i < data2.data.length; i++) {
                                var warnRecord = data2.data[i];
                                for (var j = 0; j < $scope.topology_8583right_deviceList.length; j++) {
                                    var record = $scope.topology_8583right_deviceList[j];
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
                unionpayFront: "right",
                startWarnTime: $scope.topology_startTime,
                endWarnTime: $scope.topology_endTime,
                start: 0,
                limit: 1
            }, function (data) {
                if (data && data.count) {
                    $scope.topology_8583right_warnCount = data.count;
                }
                else
                    $scope.topology_8583right_warnCount = 0;
            });
            // 20022
            _.forEach($scope.PROTOCOL_20022_TYPE, function (type20022) {
                statisticService.showTopology({
                    type: "20022",
                    systemCode: type20022,
                    starttime: $scope.topology_startTime,
                    endtime: $scope.topology_endTime
                }, function (data) {
                    if (data && data.state == "200") {
                        if (data.data && data.data.length) {
                            var row = data.data[0];
                            $scope.topology_20022_count[type20022] = row.count || 0;
                            $scope.topology_20022_duration[type20022] = row.maxDuration || 0;
                            $scope.topology_20022_successRatio[type20022] = row.count > 0 && row.scount > 0 ? Math.round(row.scount * 10000 / row.count) / 100 : 0;
                            $scope.topology_20022_responseRatio[type20022] = row.count > 0 && row.rcount > 0 ? Math.round(row.rcount * 10000 / row.count) / 100 : 0;
                            if (typeof row.allflow === "number") {
                                var flow = numeral(row.allflow).format("0b");
                                $scope.topology_20022_flow[type20022] = /\d+/.exec(flow)[0];
                                $scope.topology_20022_flowSuffix[type20022] = /[a-zA-Z]+/.exec(flow)[0];
                            }
                            else {
                                $scope.topology_20022_flow[type20022] = 0;
                                $scope.topology_20022_flowSuffix[type20022] = "M";
                            }
                        }
                    }
                });

                statisticService.showDevice({
                    type: "20022",
                    systemCode: type20022,
                    starttime: $scope.topology_startTime,
                    endtime: $scope.topology_endTime
                }, function (data) {
                    if (data && data.state == "200") {
                        data.data = data.data.sort(sortFunc);
                        if (data.data.length > 500)
                            data.data.splice(500);
                        $scope.topology_20022_deviceList[type20022] = data.data;
                        for (var i = 0; i < $scope.topology_20022_deviceList[type20022].length; i++) {
                            var record = $scope.topology_20022_deviceList[type20022][i];
                            if (typeof record.allflow === "number") {
                                record.allflow = numeral(record.allflow).format("0b");
                            }
                        }
                        //查询告警信息
                        warningService.showDevice({
                            type: "iso20022",
                            systemCode: type20022,
                            startWarnTime: $scope.topology_startTime,
                            endWarnTime: $scope.topology_endTime,
                            start: 0,
                            limit: 0
                        }, function (data2) {
                            if (data2 && data2.data) {
                                for (var i = 0; i < data2.data.length; i++) {
                                    var warnRecord = data2.data[i];
                                    for (var j = 0; j < $scope.topology_20022_deviceList[type20022].length; j++) {
                                        var record = $scope.topology_20022_deviceList[type20022][j];
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
                    systemCode: type20022,
                    startWarnTime: $scope.topology_startTime,
                    endWarnTime: $scope.topology_endTime,
                    start: 0,
                    limit: 1
                }, function (data) {
                    if (data && data.count) {
                        $scope.topology_20022_warnCount[type20022] = data.count;
                    }
                    else
                        $scope.topology_20022_warnCount[type20022] = 0;
                });
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
                    if (data.data.length > 500)
                        data.data.splice(500);
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
                    data.data = data.data.sort(sortFunc);
                    if (data.data.length > 500)
                        data.data.splice(500);
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
                    data.data = data.data.sort(sortFunc);
                    if (data.data.length > 500)
                        data.data.splice(500);
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
        //显示弹出框
        $scope.showModal = function (title, list) {
            $scope.topology_modal_title = title;
            $scope.topology_modal_deviceList = list;
            $("#topology_modal").modal("show");
        };
        //离开该页事件
        $scope.$on("$routeChangeStart", function () {
            $interval.cancel(topologyTimer);
        });
        //执行初始化
        $scope.init();
    });
});