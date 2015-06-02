define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/flowDetail.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('FlowDetailCtrl', function ($rootScope, $scope, $route, $timeout, $interval, $location, flowService) {
        //初始化变量
        $scope.QUERY_TYPE = [
            { name: "ip", displayName: "IP", conditionName: "srcip" },
            { name: "mac", displayName: "MAC", conditionName: "mac" },
            { name: "protocol", displayName: "协议", conditionName: "protocol" },
            { name: "port", displayName: "端口", conditionName: "port" }
        ];
        $scope.recordList = 0;
        $scope.startDate = null;
        $scope.startTime = null;
        $scope.queryType = $scope.QUERY_TYPE[0];
        $scope.queryTimeStr = null;
        $scope.queryTimer = null;
        //表单数据
        $scope.startDateInput = null;
        $scope.startTimeInput = null;
        //获取查询参数
        $scope.getSearchParams = function () {
            var params = {};
            if ($scope.startTime)
                params.startTime = $scope.startDate + " " + $scope.startTime;
            if ($scope.queryType)
                params.queryType = $scope.queryType.name;
            return params;
        };
        //从url获取查询参数设置变量
        $scope.setSearchParams = function () {
            var params = $location.search();
            if (!params)
                return;
            if (params.startTime) {
                var arr = params.startTime.split(" ");
                $scope.startDate = arr[0];
                $scope.startDateInput = arr[0];
                $scope.startTime = arr[1];
                $scope.startTimeInput = arr[1];
            }
            if (params.queryType) {
                for (var i = 0; i < $scope.QUERY_TYPE.length; i++) {
                    if (params.queryType == $scope.QUERY_TYPE[i].name)
                        $scope.queryType = $scope.QUERY_TYPE[i];
                }
            }
        };
        //显示统计信息
        $scope.show = function () {
            $scope.isLoading = true;
            var params = $scope.getSearchParams();
            if (_.isEqual(params, $location.search()))
                params.refresh = true;
            $location.search(params);
        };

        $scope.doQuery = function () {
            var params = {};
            if ($scope.startDate && $scope.startTime) {
                params.datetime = $scope.startDate + " " + $scope.startTime;
            }
            flowService[$scope.queryType.name].call(this, params, function (data) {
                $scope.recordList = data && data.data ? data.data : [];
                $scope.queryTimeStr = data && data.qtime ? data.qtime : null;
                if ($scope.recordList && $scope.recordList.length) {
                    var totalFlow = 0,
                        totalRecFlow = 0,
                        totalSendFlow = 0,
                        totalRecPackage = 0,
                        totalSendPackage = 0;
                    for (var i = 0; i < $scope.recordList.length; i++) {
                        var record = $scope.recordList[i];
                        record.rec_bytes = record.rec_bytes ? record.rec_bytes * 8 / 1024 : 0;
                        record.send_bytes = record.send_bytes ? record.send_bytes * 8 / 1024 : 0;
                        totalRecFlow += record.rec_bytes || 0;
                        totalSendFlow += record.send_bytes || 0;
                        totalRecPackage += record.rec_package || 0;
                        totalSendPackage += record.send_package || 0;
                        if (typeof record.time1 === "number")
                            record.time1 = new Date(record.time1).Format("yyyy-MM-dd hh:mm:ss");
                        if (typeof record.time2 === "number")
                            record.time2 = new Date(record.time2).Format("yyyy-MM-dd hh:mm:ss");
                        if (typeof record.time3 === "number")
                            record.time3 = new Date(record.time3).Format("yyyy-MM-dd hh:mm:ss");
                        if (typeof record.starttime === "number")
                            record.starttime = new Date(record.starttime).Format("yyyy-MM-dd hh:mm:ss");
                        if (typeof record.endtime === "number")
                            record.endtime = new Date(record.endtime).Format("yyyy-MM-dd hh:mm:ss");
                        if (typeof record.send_bytes === "number" || typeof record.rec_bytes === "number")
                            record.flow = ((record.send_bytes || 0) + (record.rec_bytes || 0)).toFixed(1);
                            //record.flow = numeral((record.send_bytes || 0) + (record.rec_bytes || 0)).format("0.00b");
                        //if (typeof record.send_bytes === "number")
                        //    record.send_bytes = numeral(record.send_bytes).format("0.00b");
                        //if (typeof record.rec_bytes === "number")
                        //    record.rec_bytes = numeral(record.rec_bytes).format("0.00b");
                        if (typeof record.send_bytes === "number")
                            record.send_bytes = record.send_bytes.toFixed(1);
                        if (typeof record.rec_bytes === "number")
                            record.rec_bytes = record.rec_bytes.toFixed(1);
                    }
                    totalFlow = (totalSendFlow + totalRecFlow).toFixed(1);
                    totalRecFlow = totalRecFlow.toFixed(1);
                    totalSendFlow = totalSendFlow.toFixed(1);
                    var list = [{ flow: totalFlow, rec_package: totalRecPackage, send_package: totalSendPackage, rec_bytes: totalRecFlow, send_bytes: totalSendFlow }];
                    list[0][$scope.queryType.name] = "总和";
                    $scope.recordList = list.concat($scope.recordList);
                }
            });
        };
        //搜索
        $scope.search = function () {
            if (typeof $scope.startDateInput == "undefined" || $scope.startDateInput == null || $scope.startDateInput.length == 0)
                $scope.startDate = null;
            else
                $scope.startDate = $scope.startDateInput;
            if (typeof $scope.startTimeInput == "undefined" || $scope.startTimeInput == null || $scope.startTimeInput.length == 0)
                $scope.startTime = null;
            else
                $scope.startTime = $scope.startTimeInput;
            $scope.show();
        };
        //表单输入框按键事件
        $scope.formKeypressHandler = function (e) {
            if (e.keyCode == 13) {
                $scope.search();
            }
        };
        //重置查询条件
        $scope.reset = function () {
            $scope.startDate = null;
            $scope.startTime = null;
            $scope.show();
        };
        //点击tab页
        $scope.changeTab = function (tab) {
            if (tab) {
                $scope.queryType = tab;
                $scope.show();
            }
        };
        //显示详细流量图
        $scope.showDetailChart = function (record) {
            $("#flow_detail_modal").one("shown.bs.modal", function () {
                if (record[$scope.queryType.name]) {
                    var params = {};
                    if (record[$scope.queryType.name] !== "总和")
                        params[$scope.queryType.name] = record[$scope.queryType.name];
                    if ($scope.startDate && $scope.startTime) {
                        params.endTime = $scope.startDate + " " + $scope.startTime;
                        var endTime = new Date(params.endTime.replace(/-/g, "/"));
                        endTime.setSeconds(endTime.getSeconds() - 600);
                        params.startTime = endTime.Format("yyyy-MM-dd hh:mm:ss");
                    }
                    flowService[$scope.queryType.name + "FlowChart"].call(this, params, function (data) {
                        if (data && data.data) {
                            var chartData = [];
                            for (var i = 0; i < data.data.length; i++) {
                                var d = data.data[i];
                                chartData.push({ value: [d.time, d.totalflow ? (d.totalflow * 8 / 1024).toFixed(1) : 0] });
                            }
                            option_flow.series[0].data = chartData;
                        }
                        else {
                            option_flow.series[0].data = [];
                        }
                        if ($scope.chartFlow)
                            $scope.chartFlow.dispose();
                        $scope.chartFlow = echarts.init($("#detailChart").get(0), "blue");
                        $scope.chartFlow.setOption(option_flow, true);
                    });
                }
                else {
                    option_flow.series[0].data = [];
                    if ($scope.chartFlow)
                        $scope.chartFlow.dispose();
                    $scope.chartFlow = echarts.init($("#detailChart").get(0), "blue");
                    $scope.chartFlow.setOption(option_flow, true);
                }
            }).modal("show");
        };
        var option_flow = {
            animation: true,
            title: {
                text: '总流量（kbps）'
            },
            tooltip: {
                trigger: 'axis',
                formatter: function (params) {
                    var date = new Date(params.value[0]).Format("yyyy-MM-dd hh:mm:ss");
                    return params.seriesName
                        + params.value[1] + '(' +
                        date
                        + ')<br/>'
                }
            },
            legend: {
                data: ['总流量']
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
            calculable: true,
            xAxis: [
                {
                    type: 'time'
                }
            ],
            yAxis: [{
                type: 'value'
            }, {
                type: 'value'
            }],
            series: [{
                name: '总流量',
                type: 'line',
                smooth: true,
                symbol: 'none',
                itemStyle: { normal: { areaStyle: { type: 'default' } } },
                data: []
            }]
        };
        //离开该页事件
        $scope.$on("$routeChangeStart", function () {
            if ($scope.queryTimer)
                $interval.cancel($scope.queryTimer);
        });
        //获取url查询参数
        $scope.setSearchParams();
        $scope.doQuery();
        //无日期条件每秒查询实时数据
        if (!$scope.startTime) {
            $scope.queryTimer = $interval($scope.doQuery, 3000);
        }
    });
});