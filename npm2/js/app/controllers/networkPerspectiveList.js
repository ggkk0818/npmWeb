define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/networkPerspectiveList.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('NetworkPerspectiveListCtrl', function ($rootScope, $scope, $route, $interval, $location, $timeout, $window, dateTimeService, networkPerspectiveService, networkOverviewService) {
        //初始化变量
        $scope.FIELD_LIST = [
            //{ name: "ip", displayName: "IP" },
            //{ name: "protocol", displayName: "协议" },
            //{ name: "port", displayName: "端口" },
            { name: "flowRatio", displayName: "流量速率" },
            { name: "packet", displayName: "包传输率" },
            { name: "connection", displayName: "并发连接数" },
            { name: "outTurnCount", displayName: "流出交互个数" },
            { name: "inTurnCount", displayName: "流入交互个数" },
            { name: "outTurnRatio", displayName: "流出交互率" },
            { name: "inTurnRatio", displayName: "流入交互率" },
            { name: "timeConnDuration", displayName: "连接持续时间" },
            { name: "connEstablishTime", displayName: "平均连接建立时间" },
            { name: "firstByteTime", displayName: "平均第一个字节时间" },
            { name: "newConnSuccessCount", displayName: "新建连接成功数" },
            { name: "connRatio", displayName: "新建连接率" },
            { name: "connReqCount", displayName: "新建连接请求数" },
            { name: "connRequestRatio", displayName: "新建连接请求率" },
            { name: "connFailingCount", displayName: "新建连接失败数" },
            { name: "serverResponseTime", displayName: "平均服务器响应时间" },
            { name: "clientResetRatio", displayName: "重置率（客户端/流入）" },
            { name: "serverResetRatio", displayName: "重置率（服务器/流出）" },
            { name: "outTransTime", displayName: "数据传输时间（流出）" },
            { name: "inTransTime", displayName: "数据传输时间（流入）" },
            { name: "outNetPayloadTransTime", displayName: "净荷传输时间/往返时间（流出）" },
            { name: "inNetPayloadTransTime", displayName: "净荷传输时间/往返时间（流入）" },
            { name: "outNetPayloadTime", displayName: "净荷（流出）" },
            { name: "inNetPayloadTime", displayName: "净荷（流入）" },
            { name: "inPacketLossRatio", displayName: "丢包率（流入）" },
            { name: "outPacketLossRatio", displayName: "丢包率（流出）" },
            { name: "inPacketRetransRatio", displayName: "包重传率（流入）" },
            { name: "outPacketRetransRatio", displayName: "包重传率（流出）" },
            { name: "inRetransRatio", displayName: "重传率（流入）" },
            { name: "outRetransRatio", displayName: "重传率（流出）" },
            { name: "timeRetrans", displayName: "重传延时" },
            { name: "userResponseTime", displayName: "用户响应时间" },
        ];
        $scope.keyword = null;
        $scope.serviceMap = null;
        $scope.serviceList = null;
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
            $scope.doQuery();
        };
        //获取查询参数
        $scope.getSearchParams = function () {
            var params = {};
            if ($scope.keyword)
                params.keyword = $scope.keyword;
            if ($scope.startDate)
                params.startDate = $scope.startDate;
            if ($scope.startTime)
                params.startTime = $scope.startTime;
            if ($scope.endTime)
                params.endTime = $scope.endTime;
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
        //显示信息
        $scope.show = function () {
            var params = $scope.getSearchParams();
            if (_.isEqual(params, $location.search()))
                params.refresh = true;
            $location.search(params);
        };
        //查询数据
        $scope.doQuery = function () {
            if (!$scope.keyword)
                return;
            var params = {
                ipSegment: $scope.keyword,
                start: 0,
                limit: 999
            };
            if ($scope.startDate) {
                params.startTime = $scope.startDate + " " + $scope.startTime;
                params.endTime = $scope.startDate + " " + $scope.endTime;
            }
            networkPerspectiveService.ipList(params, function (data) {
                if (data && data.data) {
                    delete params.ipSegment;
                    for (var i = 0; i < data.data.length; i++) {
                        params["ips[" + i + "]"] = data.data[i];
                    }
                    networkPerspectiveService.openServiceMetricList(params, function (data) {
                        if (data && data.status == 200) {
                            $scope.serviceMap = {};
                            $scope.serviceList = [];
                            $scope.recordList = [];
                            //按服务分类
                            for (var i = 0; i < data.ip.length; i++) {
                                var record = {};
                                for (var prop in data) {
                                    if (prop == "status")
                                        continue;
                                    if (data[prop].length > i)
                                        record[prop] = data[prop][i];
                                    else
                                        record[prop] = null;
                                }
                                var serviceName = record.protocol + ":" + record.port;
                                if (!$scope.serviceMap[serviceName]) {
                                    var service = { index: i, protocol: record.protocol, port: record.port, recordList: [] };
                                    $scope.serviceMap[serviceName] = service;
                                    $scope.serviceList.push(service);
                                }
                                $scope.serviceMap[serviceName].recordList.push(record);
                            }
                            //计算聚合平均值
                            for (var i = 0; i < $scope.serviceList.length; i++) {
                                var service = $scope.serviceList[i];
                                for (var j = 0; j < service.recordList.length; j++) {
                                    var record = service.recordList[j];
                                    for (var prop in record) {
                                        if (prop == "port" || typeof record[prop] !== "number")
                                            continue;
                                        if (!service[prop])
                                            service[prop] = record[prop];
                                        else
                                            service[prop] += record[prop];
                                    }
                                }
                                for (var prop in service) {
                                    if (prop == "port" || typeof record[prop] !== "number")
                                        continue;
                                    service[prop] = service[prop] / (service.recordList.length || 1);
                                    var str = new String(service[prop]);
                                    if (str.indexOf(".") > -1 && str.length - str.indexOf(".") - 1 > 2) {
                                        service[prop] = service[prop].toFixed(2);
                                    }
                                }
                            }
                        }
                    });
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
        //切换显示字段
        $scope.toggleDisplayField = function (field) {
            if (field)
                field.show = !field.show;
        };
        $scope.toggleAllDisplayField = function (show) {
            for (var i = 0; i < $scope.FIELD_LIST.length; i++) {
                var field = $scope.FIELD_LIST[i];
                field.show = show;
            }
        };
        //跳转到详情
        $scope.showPerspectiveDetail = function (record) {
            if (record == undefined)
                return;
            var params = {
                keyword: record.ip,
                startDate: $scope.startDate,
                startTime: $scope.startTime,
                endTime: $scope.endTime
            };
            $location.path("/network/perspective").search(params);
        };
        //时间选择器事件
        $scope.$on("rangeSlideValuesChanged", function (e, $context, elem, event, data) {
            if (data.values.min instanceof Date)
                $scope.startTime = data.values.min.Format("hh:mm:ss");
            if (data.values.max instanceof Date)
                $scope.endTime = data.values.max.Format("hh:mm:ss");
            $scope.recordList = null;
            $scope.serviceMap = null;
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