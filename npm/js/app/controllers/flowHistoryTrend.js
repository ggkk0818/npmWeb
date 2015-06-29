define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/flowHistoryTrend.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('FlowHistoryTrendCtrl', function ($rootScope, $scope, $route, $timeout, $interval, $location, dateTimeService, flowService) {
        //初始化变量
        $scope.startDate = null;
        $scope.queryTimer = null;
        $scope.chartFlow = null;
        //表单数据
        $scope.startDateInput = $scope.startDate = dateTimeService.serverTime.Format("yyyy-MM-dd");
        $scope.init = function () {
            $timeout(function () {
                $scope.chartFlow = echarts.init($("#flowChart").get(0), "blue").showLoading({ effect: "dynamicLine" });
            });
            $scope.setSearchParams();
            $scope.doQuery();
            if ($scope.startDate == dateTimeService.serverTime.Format("yyyy-MM-dd")) {
                $scope.queryTimer = $interval($scope.doQuery, 3600 * 1000);
            }
        };
        //获取查询参数
        $scope.getSearchParams = function () {
            var params = {};
            if ($scope.startDate)
                params.startTime = $scope.startDate;
            return params;
        };
        //从url获取查询参数设置变量
        $scope.setSearchParams = function () {
            var params = $location.search();
            if (!params)
                return;
            if (params.startTime) {
                $scope.startDate = params.startTime;
                $scope.startDateInput = params.startTime;
            }
        };
        //显示信息
        $scope.show = function () {
            var params = $scope.getSearchParams();
            if (_.isEqual(params, $location.search()))
                params.refresh = true;
            $location.search(params);
        };

        $scope.doQuery = function () {
            var params = { start: 0, limit: 86400 };
            if ($scope.startDate) {
                params.startTime = $scope.startDate + " 00:00:00";
                params.endTime = $scope.startDate + " 23:59:59";
            }
            flowService.timeFlow(params, function (data) {
                if (data && data.data) {
                    var flowData = [];
                    if (data.data.length) {
                        for (var i = 0; i < data.data.length; i++) {
                            var d = data.data[i];
                            flowData.push({ value: [d.time, d.totalflow ? (d.totalflow * 8 / 1024).toFixed(1) : 0] });
                        }
                    }
                    option_flow.series[0].data = flowData;
                    //if ($scope.chartFlow)
                    //    $scope.chartFlow.dispose();
                    //$scope.chartFlow = echarts.init($("#flowChart").get(0), "blue");
                    //$scope.chartFlow.setOption(option_flow, true);
                }
                $scope.chartFlow.hideLoading().setOption(option_flow, true);
            });
        };
        //搜索
        $scope.search = function () {
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
            var date = new Date($scope.startDate.replace(/-/g, "/"));
            date.setDate(date.getDate() + num);
            $scope.startDateInput = $scope.startDate = date.Format("yyyy-MM-dd");
            $scope.show();
        };

        // 折线图
        var option_flow = {
            animation: false,
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
                    mark: { show: false },
                    dataView: { show: false, readOnly: false },
                    restore: { show: false },
                    saveAsImage: { show: true }
                }
            },
            calculable: true,
            dataZoom: {
                show: true,
                y: 360,
                realtime: true,
                start: 50,
                end: 55
            },
            grid: {
                y2: 80
            },
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
        $scope.init();
        //离开该页事件
        $scope.$on("$routeChangeStart", function () {
            if ($scope.queryTimer)
                $interval.cancel($scope.queryTimer);
        });

    });
});
