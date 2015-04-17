define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/index.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('IndexCtrl', function ($rootScope, $scope, $route, $interval, $location, $timeout, $window, logService, statisticService, warningService, warningSocketService) {
        //告警时间线变量
        $scope.warnTimeLine_warnList = [];
        $scope.warnTimeLine_loading = true;
        $scope.warnTimeLine_animate = true;
        $scope.warnTimeLine_interval = 30;
        $scope.warnTimeLine_animateDuration = 30;
        $scope.warnTimeLine_minSize = 60;
        $scope.warnTimeLine_maxSize = 61;
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
            { srcip: "192.168.200.21", dstip: "192.168.200.22", allflow: "34.57MB", count: 824, warnCount: 1 },
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
            { srcip: "192.168.200.21", dstip: "192.168.200.23", allflow: "15MB", count: 400, warnCount: 0 },
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
            { srcip: "192.168.200.21", dstip: "192.168.200.24", allflow: "161MB", count: 1050, warnCount: 0 },
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
            for (var i = 0; i <= $scope.warnTimeLine_minSize; i++) {
                var block = { warnList: [] };
                block.time = new Date(new Date().getTime() - ($scope.warnTimeLine_minSize - i) * $scope.warnTimeLine_interval * 1000);
                $scope.warnTimeLine_warnList.push(block);
            }
            var warnQueryStartTime = new Date(new Date().getTime() - $scope.warnTimeLine_minSize * $scope.warnTimeLine_interval * 1000).Format("yyyy-MM-dd 00:00:00");
            var warnQueryDone = function (data, type) {
                if (data && data.state == 200 && data.data) {
                    for (var i = 0; i < data.data.length; i++) {
                        var warn = data.data[i];
                        if (typeof warn.warnTime === "number") {
                            warn.warnTime = new Date(warn.warnTime);
                            for (var j = $scope.warnTimeLine_warnList.length - 1; j >= 0; j--) {
                                var block = $scope.warnTimeLine_warnList[j];
                                if (warn.warnTime.getTime() >= block.time.getTime()) {
                                    var exists = false;
                                    for (var k = 0; k < block.warnList.length; k++) {
                                        if (block.warnList[k].type == type) {
                                            block.warnList[k].count++;
                                            exists = true;
                                            break;
                                        }
                                    }
                                    if (!exists) {
                                        block.warnList.push({ type: type, count: 1 });
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
                $scope.warnTimeLine_loading = false;
            };
            warningService.list({ type: "iso8583", startTime: warnQueryStartTime, start: 0, limit: 0 }, function (data) { warnQueryDone(data, "iso8583"); });
            warningService.list({ type: "iso20022", startTime: warnQueryStartTime, start: 0, limit: 0 }, function (data) { warnQueryDone(data, "iso20022"); });
            warningService.list({ type: "http", startTime: warnQueryStartTime, start: 0, limit: 0 }, function (data) { warnQueryDone(data, "http"); });
            warningService.list({ type: "mysql", startTime: warnQueryStartTime, start: 0, limit: 0 }, function (data) { warnQueryDone(data, "mysql"); });
            if (!warningSocketService.isOpen())
                warningSocketService.open();
            warningSocketService.on("onmessage.indexWarnTimeLine", function (e) {
                if (e && e.data) {
                    var socketData = null;
                    try {
                        socketData = JSON.parse(e.data);
                    }
                    catch (err) { }
                    if (socketData && socketData.type)
                        return;
                    else if (socketData && socketData.warn && socketData.warn.length) {
                        for (var i = 0; i < socketData.warn.length; i++) {
                            var warn = socketData.warn[i],
                                block = $scope.warnTimeLine_warnList[$scope.warnTimeLine_warnList.length - 1],
                                exists = false;
                            if (block.warnList) {
                                for (var j = 0; j < block.warnList.length; j++) {
                                    if (warn.type === block.warnList[j].type) {
                                        if (warn.count)
                                            block.warnList[j].count++;
                                        exists = true;
                                        break;
                                    }
                                }
                            }
                            if (!exists && warn.count)
                                block.warnList.push({ type: warn.type, count: 1 });
                        }
                    }
                }
            });
            warnTimeLineTimer = $interval(warnTimeLineTimerTick, 1000);
            warnTimeLineAnimate();
            //拓扑图查询
            $scope.topology_query();
            topologyTimer = $interval($scope.topology_query, 60000);
        };
        //告警时间线增加块
        var warnTimeLineTimer = null;
        var warnTimeLineTimerTick = function () {
            if (!$scope.warnTimeLine_warnList || !$scope.warnTimeLine_warnList.length)
                return;
            var now = new Date();
            if (now.getTime() - $scope.warnTimeLine_warnList[$scope.warnTimeLine_warnList.length - 1].time.getTime() > $scope.warnTimeLine_interval * 1000) {
                $scope.warnTimeLine_warnList.push({ warnList: [], time: now });
                warnTimeLineAnimate();
                if ($scope.warnTimeLine_warnList.length > $scope.warnTimeLine_maxSize) {
                    //删除多余的块
                    $scope.warnTimeLine_warnList.splice(0, $scope.warnTimeLine_warnList.length - $scope.warnTimeLine_maxSize);
                }
            }
        };
        //告警时间线动画
        var getWarnTimeLineUnitWidth = function () {
            return $("#index_warnTimeLine").width() / $scope.warnTimeLine_minSize;
        };
        var getWarnTimeLineWidth = function () {
            return getWarnTimeLineUnitWidth() * $("#index_warnTimeLine li").length;
        };
        var warnTimeLineAnimate = function () {
            $timeout(function () {
                if ($("#index_warnTimeLine li").length == $scope.warnTimeLine_warnList.length) {
                    $("#index_warnTimeLine").stop(false, false).animate({
                        scrollLeft: ($("#index_warnTimeLine li").length - $scope.warnTimeLine_minSize - 1) * getWarnTimeLineUnitWidth()
                    }, 0).animate({
                        scrollLeft: getWarnTimeLineWidth() - $("#index_warnTimeLine").width()
                    }, $scope.warnTimeLine_animateDuration * 1000, "linear");
                }
                else {
                    warnTimeLineAnimate();
                }
            });
        };
        var warnTimeLineWindowResizeHandler = function () {
            var $warnTimeLine = $("#index_warnTimeLine").stop(false, false);
            if ($warnTimeLine.scrollLeft() < ($("#index_warnTimeLine li").length - $scope.warnTimeLine_minSize - 1) * getWarnTimeLineUnitWidth()) {
                $warnTimeLine.scrollLeft(($("#index_warnTimeLine li").length - $scope.warnTimeLine_minSize - 1) * getWarnTimeLineUnitWidth());
            }
            $warnTimeLine.animate({ scrollLeft: getWarnTimeLineWidth() - $("#index_warnTimeLine").width() }, $scope.warnTimeLine_animateDuration * 1000, "linear");
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
            $scope.topology_startTime = "2015-03-31 12:00:00";
            $scope.topology_endTime = "2015-03-31 13:00:00";
            var sortFunc = function (a, b) {
                var val1 = a.count || 0;
                var val2 = b.count || 0;
                return val1 > val2 ? -1 : val1 < val2 ? 1 : 0;
            };
            var startTime8583 = "2015-02-09 11:00:00";
            var endTime8583 = "2015-02-09 12:00:00";
            statisticService.showTopology({ type: "8583", starttime: startTime8583, endtime: endTime8583 }, function (data) {
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
            statisticService.showDevice({ type: "8583", starttime: startTime8583, endtime: endTime8583 }, function (data) {
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
                    warningService.showDevice({ type: "iso8583", startWarnTime: startTime8583, endWarnTime: endTime8583, start: 0, limit: 0 }, function (data2) {
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
            warningService.list({ type: "iso8583", startWarnTime: startTime8583, endWarnTime: endTime8583, start: 0, limit: 1 }, function (data) {
                if (data && data.count) {
                    $scope.topology_8583_warnCount = data.count;
                }
                else
                    $scope.topology_8583_warnCount = 0;
            });
            //statisticService.showTopology({ type: "20022", starttime: $scope.topology_startTime, endtime: $scope.topology_endTime }, function (data) {
            //    if (data && data.state == "200") {
            //        if (data.data && data.data.length) {
            //            var row = data.data[0];
            //            $scope.topology_20022_count = row.count || 0;
            //            $scope.topology_20022_duration = row.maxDuration || 0;
            //            $scope.topology_20022_successRatio = row.count > 0 ? Math.round(row.scount * 10000 / row.count) / 100 : 0;
            //            $scope.topology_20022_responseRatio = row.count > 0 ? Math.round(row.rcount * 10000 / row.count) / 100 : 0;
            //            if (typeof row.allflow === "number") {
            //                var flow = numeral(row.allflow).format("0b");
            //                $scope.topology_20022_flow = /\d+/.exec(flow)[0];
            //                $scope.topology_20022_flowSuffix = /[a-zA-Z]+/.exec(flow)[0];
            //            }
            //        }
            //    }
            //});
            //statisticService.showDevice({ type: "20022", starttime: $scope.topology_startTime, endtime: $scope.topology_endTime }, function (data) {
            //    if (data && data.state == "200") {
            //        $scope.topology_20022_deviceList = data.data;
            //        for (var i = 0; i < $scope.topology_20022_deviceList.length; i++) {
            //            var record = $scope.topology_20022_deviceList[i];
            //            if (typeof record.allflow === "number") {
            //                record.allflow = numeral(record.allflow).format("0b");
            //            }
            //        }
            //        //查询告警信息
            //        warningService.showDevice({ type: "iso20022", startWarnTime: $scope.topology_startTime, endWarnTime: $scope.topology_endTime, start: 0, limit: 0 }, function (data2) {
            //            if (data2 && data2.data) {
            //                for (var i = 0; i < data2.data.length; i++) {
            //                    var warnRecord = data2.data[i];
            //                    for (var j = 0; j < $scope.topology_20022_deviceList.length; j++) {
            //                        var record = $scope.topology_20022_deviceList[j];
            //                        if (warnRecord.srcip == record.srcip && warnRecord.dstip == record.dstip) {
            //                            record.warnCount = warnRecord.count;
            //                        }
            //                    }
            //                }
            //            }
            //        });
            //    }
            //});
            //warningService.list({ type: "iso20022", startWarnTime: $scope.topology_startTime, endWarnTime: $scope.topology_endTime, start: 0, limit: 1 }, function (data) {
            //    if (data && data.count) {
            //        $scope.topology_20022_warnCount = data.count;
            //    }
            //    else
            //        $scope.topology_20022_warnCount = 0;
            //});
            $scope.topology_startTime = "2015-04-08 02:00:00";
            $scope.topology_endTime = "2015-04-08 03:00:00";
            statisticService.showTopology({ type: "http", starttime: $scope.topology_startTime, endtime: $scope.topology_endTime }, function (data) {
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
            statisticService.showDevice({ type: "http", starttime: $scope.topology_startTime, endtime: $scope.topology_endTime }, function (data) {
                if (data && data.state == "200") {
                    data.data = data.data.sort(sortFunc);
                    if(data.data.length > 5)
                    data.data.splice(5);
                    $scope.topology_http_deviceList = data.data;
                    for (var i = 0; i < $scope.topology_http_deviceList.length; i++) {
                        var record = $scope.topology_http_deviceList[i];
                        if (typeof record.allflow === "number") {
                            record.allflow = numeral(record.allflow).format("0b");
                        }
                    }
                    //查询告警信息
                    warningService.showDevice({ type: "http", startWarnTime: $scope.topology_startTime, endWarnTime: $scope.topology_endTime, start: 0, limit: 0 }, function (data2) {
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
            warningService.list({ type: "http", startWarnTime: $scope.topology_startTime, endWarnTime: $scope.topology_endTime, start: 0, limit: 1 }, function (data) {
                if (data && data.count) {
                    $scope.topology_http_warnCount = data.count;
                }
                else
                    $scope.topology_http_warnCount = 0;
            });
            //$scope.topology_startTime = "2015-03-31 12:00:00";
            //$scope.topology_endTime = "2015-03-31 13:00:00";
            //statisticService.showTopology({ type: "mysql", starttime: $scope.topology_startTime, endtime: $scope.topology_endTime }, function (data) {
            //    if (data && data.state == "200") {
            //        if (data.data && data.data.length) {
            //            var row = data.data[0];
            //            $scope.topology_mysql_count = row.count || 0;
            //            $scope.topology_mysql_duration = row.maxDuration || 0;
            //            $scope.topology_mysql_successRatio = row.count > 0 ? Math.round(row.scount * 10000 / row.count) / 100 : 0;
            //            if (typeof row.allflow === "number") {
            //                var flow = numeral(row.allflow).format("0b");
            //                $scope.topology_mysql_flow = /\d+/.exec(flow)[0];
            //                $scope.topology_mysql_flowSuffix = /[a-zA-Z]+/.exec(flow)[0];
            //            }
            //        }
            //    }
            //});
            //statisticService.showDevice({ type: "mysql", starttime: $scope.topology_startTime, endtime: $scope.topology_endTime }, function (data) {
            //    if (data && data.state == "200") {
            //        $scope.topology_mysql_deviceList = data.data;
            //        for (var i = 0; i < $scope.topology_mysql_deviceList.length; i++) {
            //            var record = $scope.topology_mysql_deviceList[i];
            //            if (typeof record.allflow === "number") {
            //                record.allflow = numeral(record.allflow).format("0b");
            //            }
            //        }
            //        //查询告警信息
            //        warningService.showDevice({ type: "mysql", startWarnTime: $scope.topology_startTime, endWarnTime: $scope.topology_endTime, start: 0, limit: 0 }, function (data2) {
            //            if (data2 && data2.data) {
            //                for (var i = 0; i < data2.data.length; i++) {
            //                    var warnRecord = data2.data[i];
            //                    for (var j = 0; j < $scope.topology_mysql_deviceList.length; j++) {
            //                        var record = $scope.topology_mysql_deviceList[j];
            //                        if (warnRecord.srcip == record.srcip && warnRecord.dstip == record.dstip) {
            //                            record.warnCount = warnRecord.count;
            //                        }
            //                    }
            //                }
            //            }
            //        });
            //    }
            //});
            //warningService.list({ type: "mysql", startWarnTime: $scope.topology_startTime, endWarnTime: $scope.topology_endTime, start: 0, limit: 1 }, function (data) {
            //    if (data && data.count) {
            //        $scope.topology_mysql_warnCount = data.count;
            //    }
            //    else
            //        $scope.topology_mysql_warnCount = 0;
            //});
        };
        //窗口调整时更新各Panel高度
        var windowResize = function () {
            var $dataPanel = $("#dataPanel"),
                offsetTop = $dataPanel.parent().offset().top,
                margin = 20;
            //$dataPanel.outerHeight($($window).height() - offsetTop - margin);
            //计算内容div高度
            var $indexTopology = $("#dataPanel .index_topology");
            //$indexTopology.outerHeight($dataPanel.height() - ($indexTopology.offset().top - offsetTop));
        };
        $($window).off("resize.index").on("resize.index", windowResize).trigger("resize.index");
        $($window).off("resize.indexWarnTimeLine").on("resize.indexWarnTimeLine", warnTimeLineWindowResizeHandler);
        //离开该页事件
        $scope.$on("$routeChangeStart", function () {
            $($window).off("resize.index resize.indexWarnTimeLine");
            warningSocketService.off("onmessage.indexWarnTimeLine");
            $interval.cancel(warnTimeLineTimer);
            $interval.cancel(topologyTimer);
        });
        //执行初始化
        $scope.init();
    });
});