define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/index.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('IndexCtrl', function ($rootScope, $scope, $route, $interval, $location, $timeout, $window, logService, statisticService, warningService, warningSocketService) {
        //告警时间线变量
        $scope.warnTimeLine_warnList = [];
        $scope.warnTimeLine_loading = true;
        $scope.warnTimeLine_animate = true;
        $scope.warnTimeLine_interval = 20;
        $scope.warnTimeLine_minSize = 30;
        $scope.warnTimeLine_maxSize = 50;
        //拓扑图变量
        $scope.topology_8583_count = 0;
        $scope.topology_8583_duration = 0;
        $scope.topology_8583_successRatio = 0;
        $scope.topology_8583_warnCount = 0;
        $scope.topology_20022_count = 0;
        $scope.topology_20022_duration = 0;
        $scope.topology_20022_successRatio = 0;
        $scope.topology_20022_warnCount = 0;
        $scope.topology_http_count = 0;
        $scope.topology_http_duration = 0;
        $scope.topology_http_successRatio = 0;
        $scope.topology_http_warnCount = 0;
        $scope.topology_mysql_count = 0;
        $scope.topology_mysql_duration = 0;
        $scope.topology_mysql_successRatio = 0;
        $scope.topology_mysql_warnCount = 0;
        //初始化
        $scope.init = function () {
            //告警时间线
            for (var i = 0; i < $scope.warnTimeLine_minSize; i++) {
                var block = { warnList: [] };
                block.time = new Date(new Date().getTime() - ($scope.warnTimeLine_minSize - 1 - i) * $scope.warnTimeLine_interval * 1000);
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
                                    for (var k = 0; k < block.warnList; k++) {
                                        if (block.warnList[k].type = type) {
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
            warningService.list({ type: "resp8583", startTime: warnQueryStartTime, start: 0, limit: 0 }, function (data) { warnQueryDone(data, "resp8583"); });
            warningService.list({ type: "resp20022", startTime: warnQueryStartTime, start: 0, limit: 0 }, function (data) { warnQueryDone(data, "resp20022"); });
            warningService.list({ type: "proc8583", startTime: warnQueryStartTime, start: 0, limit: 0 }, function (data) { warnQueryDone(data, "proc8583"); });
            warningService.list({ type: "proc20022", startTime: warnQueryStartTime, start: 0, limit: 0 }, function (data) { warnQueryDone(data, "proc20022"); });
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
        };
        //告警时间线增加块
        var warnTimeLineTimer = null;
        var warnTimeLineTimerTick = function () {
            if (!$scope.warnTimeLine_warnList || !$scope.warnTimeLine_warnList.length)
                return;
            var now = new Date();
            if (now.getTime() - $scope.warnTimeLine_warnList[$scope.warnTimeLine_warnList.length - 1].time.getTime() > $scope.warnTimeLine_interval * 1000) {
                $scope.warnTimeLine_animate = true;
                $scope.warnTimeLine_warnList.push({ warnList: [], time: now });
                if ($scope.warnTimeLine_warnList.length > $scope.warnTimeLine_maxSize) {
                    $timeout(function () {
                        //删除多余的块
                        $scope.warnTimeLine_animate = false;
                        $scope.warnTimeLine_warnList.splice(0, $scope.warnTimeLine_warnList.length - $scope.warnTimeLine_maxSize);
                    }, 2000);
                }
            }
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
            statisticService.showTopology8583({ starttime: "2015-04-01 17:06:00", endtime: "2015-04-02 17:06:00" }, function (data) {
                if (data && data.state == "200") {
                    if (data.data && data.data.length) {
                        var row = data.data[0];
                        $scope.topology_8583_count = row.count;
                        $scope.topology_8583_duration = row.avgDuration;
                        $scope.topology_8583_successRatio = row.scount * 100 / row.count;
                    }
                }
            });
            statisticService.showTopology20022({ starttime: "2015-04-01 17:06:00", endtime: "2015-04-02 17:06:00" }, function (data) {
                if (data && data.state == "200") {
                    if (data.data && data.data.length) {
                        var row = data.data[0];
                        $scope.topology_20022_count = row.count;
                        $scope.topology_20022_duration = row.avgDuration;
                        $scope.topology_20022_successRatio = row.scount * 100 / row.count;
                    }
                }
            });
            statisticService.showTopologyHttp({ starttime: "2015-04-01 17:06:00", endtime: "2015-04-02 17:06:00" }, function (data) {
                if (data && data.state == "200") {
                    if (data.data && data.data.length) {
                        var row = data.data[0];
                        $scope.topology_http_count = row.count;
                        $scope.topology_http_duration = row.avgDuration;
                        $scope.topology_http_successRatio = row.scount * 100 / row.count;
                    }
                }
            });
            statisticService.showTopologyMysql({ starttime: "2015-04-01 17:06:00", endtime: "2015-04-02 17:06:00" }, function (data) {
                if (data && data.state == "200") {
                    if (data.data && data.data.length) {
                        var row = data.data[0];
                        $scope.topology_mysql_count = row.count;
                        $scope.topology_mysql_duration = row.avgDuration;
                        $scope.topology_mysql_successRatio = row.scount * 100 / row.count;
                    }
                }
            });
        };
        $scope.topology_query();
        //窗口调整时更新各Panel高度
        var windowResize = function () {
            var $dataPanel = $("#dataPanel"),
                offsetTop = $dataPanel.parent().offset().top,
                margin = 20;
            $dataPanel.outerHeight($($window).height() - offsetTop - margin);
            //计算内容div高度
            var $indexTopology = $("#dataPanel .index_topology");
            $indexTopology.outerHeight($dataPanel.height() - ($indexTopology.offset().top - offsetTop));
        };
        $($window).off("resize.index").on("resize.index", windowResize).trigger("resize.index");
        //离开该页事件
        $scope.$on("$routeChangeStart", function () {
            $($window).off("resize.index");
            warningSocketService.off("onmessage.indexWarnTimeLine");
            $interval.cancel(warnTimeLineTimer);
        });
        //执行初始化
        $scope.init();
    });
});