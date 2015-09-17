define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/networkPerspective.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('NetworkPerspectiveCtrl', function ($rootScope, $scope, $route, $interval, $location, $timeout, $window, dateTimeService, networkPerspectiveService, networkOverviewService) {
        //初始化变量
        $scope.keyword = null;
        $scope.searchObj = null;
        $scope.recordList = null;
        $scope.startDate = null;
        $scope.startTime = null;
        $scope.endTime = null;
        //表单数据
        $scope.startDateInput = $scope.startDate = dateTimeService.serverTime.Format("yyyy-MM-dd");
        $scope.keywordInput = null;
        //初始化
        $scope.init = function () {
            $scope.setSearchParams();
            $scope.getIpGroupAndSegment();
            $timeout(function () {
                $("#affix").affix({
                    offset: {
                        top: 200,
                        bottom: 50
                    }
                });
                $("#affix").on("click", "a", function () {
                    var $a = $(this);
                    if ($a.data("target")) {
                        $(window).scrollTo($a.data("target"), "normal");
                    }
                    else if (typeof $a.data("top") !== "undefined") {
                        $(window).scrollTo(parseInt($a.data("top"), 10), "normal");
                    }
                });
                $("body").scrollspy({ target: "#affix" });
            });
        };
        //获取查询参数
        $scope.getSearchParams = function () {
            var params = {};
            if ($scope.keyword)
                params.keyword = $scope.keyword;
            if ($scope.startDate)
                params.startDate = $scope.startDate;
            return params;
        };
        //从url获取查询参数设置变量
        $scope.setSearchParams = function () {
            var params = $location.search();
            if (!params)
                return;
            if (params.keyword) {
                $scope.keyword = params.keyword;
                $scope.keywordInput = params.keyword;
            }
            if (params.startDate) {
                $scope.startDate = params.startDate;
                $scope.startDateInput = params.startDate;
            }
            if (params.startTime)
                $scope.startTime = params.startTime;
            if (params.endTime)
                $scope.endTime = params.endTime;
            if (!$scope.startTime || !$scope.endTime) {
                var today = new Date($scope.startDate.replace(/-/g, "/"));
                if (!$scope.endTime) {
                    if ($scope.startTime) {
                        var time = new Date($scope.startDate.replace(/-/g, "/") + " " + $scope.startTime);
                        time.setHours(time.getHours() + 1);
                        if (time.getDate() == today.getDate()) {
                            $scope.endTime = time.Format("hh:mm:ss");
                        }
                        else {
                            $scope.endTime = "23:59:59";
                        }
                    }
                    else {
                        $scope.endTime = dateTimeService.serverTime.Format("hh:mm:ss");
                    }
                }
                if (!$scope.startTime) {
                    var time = new Date($scope.startDate.replace(/-/g, "/") + " " + $scope.endTime);
                    time.setHours(time.getHours() - 1);
                    if (time.getDate() == today.getDate()) {
                        $scope.startTime = time.Format("hh:mm:ss");
                    }
                    else {
                        $scope.startTime = "00:00:00";
                    }
                }
            }
        };
        //查询ip组和网段信息
        $scope.getIpGroupAndSegment = function () {
            var params = {
                startTime: $scope.startDate + " 00:00:00",
                endTime: $scope.startDate + " 23:59:59",
                start: 0,
                limit: 999
            };
            networkOverviewService.ipSegment(params, function (data) {
                if (data && data.data) {
                    $scope.ipSegmentList = data.data || [];
                    if (!$scope.searchObj && $scope.ipSegmentList.length) {
                        for (var i = 0; i < $scope.ipSegmentList.length; i++) {
                            var segment = $scope.ipSegmentList[i];
                            if ($scope.keyword == segment.ipSegment) {
                                $scope.searchObj = segment;
                                
                                break;
                            }
                        }
                        if ($scope.searchObj || $scope.groupList) {
                            $scope.doQuery();
                        }
                    }
                    else if (!$scope.searchObj && $scope.groupList) {
                        $scope.doQuery();
                    }
                }
            });
            networkOverviewService.groupList(params, function (data) {
                if (data && data.data) {
                    $scope.groupList = data.data || [];
                    if (!$scope.searchObj && $scope.groupList.length) {
                        for (var i = 0; i < $scope.groupList.length; i++) {
                            var group = $scope.groupList[i];
                            if ($scope.keyword == group.group) {
                                $scope.searchObj = group;
                                break;
                            }
                        }
                        if ($scope.searchObj || $scope.ipSegmentList) {
                            $scope.doQuery();
                        }
                    }
                    else if (!$scope.searchObj && $scope.ipSegmentList) {
                        $scope.doQuery();
                    }
                }
            });
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
            if ($scope.searchObj) {
                if ($scope.searchObj.ips) {
                    for (var i = 0; i < $scope.searchObj.ips.length; i++) {
                        params["ips[" + i + "]"] = $scope.searchObj.ips[i];
                    }
                }
            }
            else if ($scope.keyword) {
                params.ip = $scope.keyword;
            }
            if ($scope.startDate) {
                params.startTime = $scope.startDate + " " + $scope.startTime;
                params.endTime = $scope.startDate + " " + $scope.endTime;
            }
            networkPerspectiveService.basic(params, function (data) {
                $scope.baseRecord = data || {};
                if ($scope.baseRecord.time && $scope.baseRecord.time.length) {
                    for (var i = 0; i < $scope.baseRecord.time.length; i++) {
                        $scope.baseRecord.time[i] = new Date($scope.baseRecord.time[i]);
                    }
                    $timeout(function () {
                        if ($scope.baseRecord.flow) {
                            var chartData = [];
                            for (var i = 0; i < $scope.baseRecord.flow.length; i++) {
                                if (!$scope.baseRecord.time || i >= $scope.baseRecord.time.length)
                                    break;
                                chartData.push({ time: $scope.baseRecord.time[i], value: $scope.baseRecord.flow[i] });
                            }
                            MG.data_graphic({
                                data: chartData,
                                full_width: true,
                                height: 120,
                                right: 20,
                                top: 17,
                                mouseover: function (d, i) {
                                    //custom format the rollover text, show days
                                    var str = (d.value ? d.value.toFixed(2) : 0) + "kbps" + (d.time instanceof Date ? " " + d.time.Format("hh:mm:ss") : "");
                                    $('#networkPerspective_basic_flow svg .mg-active-datapoint').html(str);
                                },
                                target: '#networkPerspective_basic_flow',
                                //linked: true,
                                x_accessor: 'time',
                                y_accessor: 'value'
                            });
                        }
                        if ($scope.baseRecord.package) {
                            var chartData = [];
                            for (var i = 0; i < $scope.baseRecord.package.length; i++) {
                                if (!$scope.baseRecord.time || i >= $scope.baseRecord.time.length)
                                    break;
                                chartData.push({ time: $scope.baseRecord.time[i], value: $scope.baseRecord.package[i] });
                            }
                            MG.data_graphic({
                                data: chartData,
                                full_width: true,
                                height: 120,
                                right: 20,
                                top: 17,
                                mouseover: function (d, i) {
                                    //custom format the rollover text, show days
                                    var str = (d.value || 0) + "pps" + (d.time instanceof Date ? d.time.Format("hh:mm:ss") + " " : "");
                                    $('#networkPerspective_basic_package svg .mg-active-datapoint').html(str);
                                },
                                target: '#networkPerspective_basic_package',
                                //linked: true,
                                x_accessor: 'time',
                                y_accessor: 'value'
                            });
                        }
                        if ($scope.baseRecord.connection) {
                            var chartData = [];
                            for (var i = 0; i < $scope.baseRecord.connection.length; i++) {
                                if (!$scope.baseRecord.time || i >= $scope.baseRecord.time.length)
                                    break;
                                chartData.push({ time: $scope.baseRecord.time[i], value: $scope.baseRecord.connection[i] });
                            }
                            MG.data_graphic({
                                data: chartData,
                                full_width: true,
                                height: 120,
                                right: 20,
                                top: 17,
                                mouseover: function (d, i) {
                                    //custom format the rollover text, show days
                                    var str = (d.value || 0) + "连接" + (d.time instanceof Date ? " " + d.time.Format("hh:mm:ss") : "");
                                    $('#networkPerspective_basic_connection svg .mg-active-datapoint').html(str);
                                },
                                target: '#networkPerspective_basic_connection',
                                x_accessor: 'time',
                                y_accessor: 'value'
                            });
                        }
                        if ($scope.baseRecord.turn) {
                            var chartData = [];
                            for (var i = 0; i < $scope.baseRecord.turn.length; i++) {
                                if (!$scope.baseRecord.time || i >= $scope.baseRecord.time.length)
                                    break;
                                chartData.push({ time: $scope.baseRecord.time[i], value: $scope.baseRecord.turn[i] });
                            }
                            MG.data_graphic({
                                data: chartData,
                                full_width: true,
                                height: 120,
                                right: 20,
                                top: 17,
                                mouseover: function (d, i) {
                                    //custom format the rollover text, show days
                                    var str = (d.value || 0) + "交互" + (d.time instanceof Date ? " " + d.time.Format("hh:mm:ss") : "");
                                    $('#networkPerspective_basic_turn svg .mg-active-datapoint').html(str);
                                },
                                target: '#networkPerspective_basic_turn',
                                x_accessor: 'time',
                                y_accessor: 'value'
                            });
                        }
                    });
                }
            });
            //查询开启的服务
            var progressBarClassArr = ["", "progress-bar-info", "progress-bar-success", "progress-bar-warning", "progress-bar-danger"];
            var serviceColorMap = {};
            networkPerspectiveService.openService(params, function (data) {
                $scope.serviceRecordList = data && data.data ? data.data : [];
                $scope.serviceRatioTotal = 0;
                $scope.serviceRatioList = [];
                for (var i = 0; i < $scope.serviceRecordList.length; i++) {
                    var record = $scope.serviceRecordList[i], ratioRecord = {};
                    $.extend(ratioRecord, record);
                    $scope.serviceRatioTotal += record.flow || 0;
                    if (serviceColorMap[record.protocol + record.port] == undefined) {
                        serviceColorMap[record.protocol + record.port] = (i >= progressBarClassArr.length ? progressBarClassArr[Math.floor(Math.random() * 5)] : progressBarClassArr[i]);
                    }
                    ratioRecord.progressBarClass = serviceColorMap[record.protocol + record.port];
                    $scope.serviceRatioList.push(ratioRecord);
                    $scope.doServiceDetailQuery(record);
                }
                if ($scope.serviceRatioList.length > 5) {
                    var otherFlow = 0;
                    for (var i = 4; i < $scope.serviceRatioList.length; i++) {
                        var service = $scope.serviceRatioList[i];
                        otherFlow += service.flow;
                    }
                    $scope.serviceRatioList[4].name = "其他";
                    $scope.serviceRatioList[4].flow = otherFlow;
                    $scope.serviceRatioList.splice(5, $scope.serviceRatioList.length - 5);
                }
                for (var i = 0; i < $scope.serviceRatioList.length; i++) {
                    var record = $scope.serviceRatioList[i];
                    record.percent = (record.flow || 0) / $scope.serviceRatioTotal * 100;
                }
            });
            networkPerspectiveService.usageService(params, function (data) {
                $scope.usageServiceRecordList = data && data.data ? data.data : [];
                $scope.usageServiceRecordNav = {};
                $scope.usageServiceRatioTotal = 0;
                $scope.usageServiceRatioList = [];
                for (var i = 0; i < $scope.usageServiceRecordList.length; i++) {
                    var record = $scope.usageServiceRecordList[i];
                    if(!record.protocol)
                        continue;
                    if (record.server_ip)
                        record.server_ip_replace = record.server_ip.replace(/\./g, "");
                    if (!$scope.usageServiceRecordNav[record.protocol]) {
                        $scope.usageServiceRecordNav[record.protocol] = { protocol: record.protocol, recordList: [] };
                    }
                    var protocolNav = $scope.usageServiceRecordNav[record.protocol];
                    protocolNav.recordList.push(record);
                }
                for (var i = 0; i < $scope.usageServiceRecordList.length; i++) {
                    var record = $scope.usageServiceRecordList[i], ratioRecord = {};
                    $.extend(ratioRecord, record);
                    $scope.usageServiceRatioTotal += record.flow || 0;
                    if (serviceColorMap[record.protocol + record.port] == undefined) {
                        serviceColorMap[record.protocol + record.port] = (i >= progressBarClassArr.length ? progressBarClassArr[Math.floor(Math.random() * 5)] : progressBarClassArr[i]);
                    }
                    ratioRecord.progressBarClass = serviceColorMap[record.protocol + record.port];
                    $scope.usageServiceRatioList.push(ratioRecord);
                    $scope.doUsageServiceDetailQuery(record);
                }
                if ($scope.usageServiceRatioList.length > 5) {
                    var otherFlow = 0;
                    for (var i = 4; i < $scope.usageServiceRatioList.length; i++) {
                        var service = $scope.usageServiceRatioList[i];
                        otherFlow += service.flow;
                    }
                    $scope.usageServiceRatioList[4].name = "其他";
                    $scope.usageServiceRatioList[4].flow = otherFlow;
                    $scope.usageServiceRatioList.splice(5, $scope.usageServiceRatioList.length - 5);
                }
                for (var i = 0; i < $scope.usageServiceRatioList.length; i++) {
                    var record = $scope.usageServiceRatioList[i];
                    record.percent = (record.flow || 0) / $scope.usageServiceRatioTotal * 100;
                }
            });
        };
        //查询详情
        $scope.doServiceDetailQuery = function (record) {
            var params = {};
            if ($scope.searchObj) {
                if ($scope.searchObj.ips) {
                    for (var i = 0; i < $scope.searchObj.ips.length; i++) {
                        params["ips[" + i + "]"] = $scope.searchObj.ips[i];
                    }
                }
            }
            else if ($scope.keyword) {
                params.ip = $scope.keyword;
            }
            if (record) {
                params.protocol = record.protocol;
                params.port = record.port;
            }
            if ($scope.startDate) {
                params.startTime = $scope.startDate + " " + $scope.startTime;
                params.endTime = $scope.startDate + " " + $scope.endTime;
            }
            networkPerspectiveService.openServiceMetric(params, function (data) {
                if (data && data.status == 200) {
                    record.metric = data;
                }
            });
        };
        $scope.doUsageServiceDetailQuery = function (record) {
            var params = {};
            if ($scope.searchObj) {
                if ($scope.searchObj.ips) {
                    for (var i = 0; i < $scope.searchObj.ips.length; i++) {
                        params["ips[" + i + "]"] = $scope.searchObj.ips[i];
                    }
                }
            }
            else if ($scope.keyword) {
                params.ip = $scope.keyword;
            }
            if (record) {
                params.protocol = record.protocol;
                params.port = record.port;
            }
            if ($scope.startDate) {
                params.startTime = $scope.startDate + " " + $scope.startTime;
                params.endTime = $scope.startDate + " " + $scope.endTime;
            }
            networkPerspectiveService.usageServiceMetric(params, function (data) {
                if (data && data.status == 200) {
                    record.metric = data;
                }
            });
        };
        //搜索
        $scope.search = function () {
            if (typeof $scope.keywordInput == "undefined" || $scope.keywordInput == null || $scope.keywordInput.length == 0)
                $scope.keyword = null;
            else
                $scope.keyword = $scope.keywordInput;
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
                date.setDate(date.getDate() + num);
                $scope.startDateInput = $scope.startDate = date.Format("yyyy-MM-dd");
            }
            else {
                $scope.startDateInput = $scope.startDate = dateTimeService.serverTime.Format("yyyy-MM-dd");
            }
            $scope.show();
        };
        //时间选择器事件
        $scope.$on("rangeSlideValuesChanged", function (e, $context, elem, event, data) {
            if (data.values.min instanceof Date)
                $scope.startTime = data.values.min.Format("hh:mm:ss");
            if (data.values.max instanceof Date)
                $scope.endTime = data.values.max.Format("hh:mm:ss");
            $scope.recordList = null;
            $scope.serviceList = null;
            $scope.doQuery();
        });
        //离开该页事件
        $scope.$on("$routeChangeStart", function () {
        });
        //执行初始化
        $scope.init();
    });
});