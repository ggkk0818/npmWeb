define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/deviceStatistic.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('IpTopologyCtrl', function ($rootScope, $scope, $route, $timeout, $location, statisticService, warningService, dateTimeService) {
        //初始化变量
        $scope.DURATION_TYPE = [
            { id: "minute", name: "前1分钟" },
            { id: "hour", name: "前1小时" },
            { id: "day", name: "前1天" }
        ];
        $scope.startDate = null;
        $scope.startTime = null;
        $scope.durationType = $scope.DURATION_TYPE[0];
        $scope.ipTabActive = true;
        $scope.deviceTabActive = false;
        //表单数据
        $scope.startDateInput = $scope.startTime = dateTimeService.serverTime.Format("yyyy-MM-dd");
        $scope.startTimeInput = $scope.startTime = dateTimeService.serverTime.Format("hh:mm:ss");
        //图表变量
        $scope.topologyChart = null;
        $scope.ipLegend = ['8583', '20022', 'mysql', 'dns', 'http', 'radius', 'dhcp', 'oracle', 'db2', 'soap', 'mq'];
        $scope.ipNodes = null;
        $scope.ipLinks = null;
        $scope.deviceLegend = ["路由器", "交换机", "服务器"];
        $scope.deviceNodes = null;
        $scope.deviceLinks = null;
        //获取查询参数
        $scope.getSearchParams = function () {
            var params = {};
            if ($scope.startTime)
                params.startTime = $scope.startDate + " " + $scope.startTime;
            if ($scope.durationType)
                params.durationType = $scope.durationType.id;
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
            if (params.durationType) {
                for (var i = 0; i < $scope.DURATION_TYPE.length; i++) {
                    if (params.durationType == $scope.DURATION_TYPE[i].id)
                        $scope.durationType = $scope.DURATION_TYPE[i];
                }
            }
        };
        //显示
        $scope.show = function () {
            $scope.isLoading = true;
            var params = $scope.getSearchParams();
            if (_.isEqual(params, $location.search()))
                params.refresh = true;
            $location.search(params);
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
        //图表
        var option = {
            title: {
                text: '',
                subtext: '',
                x: 'right',
                y: 'bottom'
            },
            tooltip: {
                trigger: 'item',
                formatter: '{b}'
            },
            toolbox: {
                show: true,
                feature: {
                    restore: { show: true },
                    magicType: { show: true, type: ['force', 'chord'] },
                    saveAsImage: { show: true }
                }
            },
            legend: {
                x: 'left',
                data: ['8583', '20022', 'mysql', 'dns', 'http', 'radius', 'dhcp', 'oracle', 'db2', 'soap', 'mq']
            },
            series: [
                {
                    type: 'force',
                    name: "",
                    ribbonType: false,
                    categories: [{
                        name: '8583'
                    },
                    {
                        name: '20022'
                    },
                    {
                        name: 'mysql'
                    },
                    {
                        name: 'dns'
                    },
                    {
                        name: 'http'
                    },
                    {
                        name: 'radius'
                    },
                    {
                        name: 'dhcp'
                    },
                    {
                        name: 'oracle'
                    },
                    {
                        name: 'db2'
                    },
                    {
                        name: 'soap'
                    },
                    {
                        name: 'mq'
                    }],
                    itemStyle: {
                        normal: {
                            label: {
                                show: true,
                                textStyle: {
                                    color: '#333'
                                }
                            },
                            nodeStyle: {
                                brushType: 'both',
                                borderColor: 'rgba(255,215,0,0.4)',
                                borderWidth: 1
                            }
                        },
                        emphasis: {
                            label: {
                                show: false
                                // textStyle: null      // 默认使用全局文本样式，详见TEXTSTYLE
                            },
                            nodeStyle: {
                                //r: 30
                            },
                            linkStyle: {}
                        }
                    },
                    minRadius: 15,
                    maxRadius: 25,
                    gravity: 1.1,
                    scaling: 1.2,
                    draggable: true,
                    linkSymbol: 'arrow',
                    symbolSize: 10,
                    steps: 10,
                    coolDown: 0.9,
                    //preventOverlap: true,
                    nodes: [],
                    links: []
                }
            ]
        };

        $scope.queryTopology = function () {
            var params = {
                start: 0,
                limit: 0
            };
            if ($scope.startDate && $scope.startTime) {
                params.endtime = $scope.startDate + " " + $scope.startTime;
            }
            if ($scope.startDate && $scope.startTime && $scope.durationType) {
                var endTime = new Date($scope.startDate.replace(/-/g, "/") + " " + $scope.startTime),
                    durationId = $scope.durationType.id;
                if (durationId == "minute") {
                    endTime.setMinutes(endTime.getMinutes() - 1);
                }
                else if (durationId == "hour") {
                    endTime.setHours(endTime.getHours() - 1);
                }
                else if (durationId == "day") {
                    endTime.setDate(endTime.getDate() - 1);
                }
                params.starttime = endTime.Format("yyyy-MM-dd hh:mm:ss");
            }
            statisticService.ipTopology(params, function (data) {
                if (data && data.data) {
                    var nodes = {}, linkList = [], protocols = {};
                    //获取协议index数值
                    if (option && option.legend && option.legend.data) {
                        for (var i = 0; i < option.legend.data.length; i++) {
                            protocols[option.legend.data[i]] = i;
                        }
                    }
                    for (var i = 0; i < data.data.length; i++) {
                        var record = data.data[i];
                        if (typeof record === "string" && record.length > 0) {
                            var arr = record.split(",");
                            if (!arr || arr.length < 3 || typeof protocols[arr[2]] === "undefine")
                                continue;
                            //var srcIp = arr[0] + "-" + arr[2],
                            //    dstIp = arr[1] + "-" + arr[2];
                            var srcIp = arr[0],
                                dstIp = arr[1];
                            if (!nodes[srcIp]) {
                                nodes[srcIp] = {
                                    category: protocols[arr[2]],
                                    name: srcIp,
                                    value: 10
                                };
                            }
                            if (!nodes[dstIp]) {
                                nodes[dstIp] = {
                                    category: protocols[arr[2]],
                                    name: dstIp,
                                    value: 10
                                };
                            }
                            linkList.push({
                                source: srcIp,
                                target: dstIp,
                                name: arr[2],
                                weight: 1
                            });
                        }
                    }
                    var nodeList = [];
                    for (var name in nodes) {
                        nodeList.push(nodes[name]);
                    }
                }
                else {
                    $scope.ipNodes = null;
                    $scope.ipLinks = null;
                }
                if ($scope.ipTabActive)
                    $scope.showIpChart();
            });
            statisticService.deviceTopology(params, function (data) {
                if (data && data.data) {
                    var nodes = {}, linkList = [], routerRef = {};
                    for (var i = 0; i < data.routers.length; i++) {
                        var router = data.routers[i];
                        if (!nodes[router.name]) {
                            nodes[router.name] = {
                                category: "路由器",
                                name: router.name,
                                value: 10
                            };
                            nodes[router.name + "-1"] = {
                                category: "交换机",
                                name: router.name + "-1",
                                value: 8
                            };
                            nodes[router.name + "-2"] = {
                                category: "交换机",
                                name: router.name + "-2",
                                value: 8
                            };
                            linkList.push({
                                source: router.name + "-1",
                                target: router.name,
                                weight: 1
                            });
                            linkList.push({
                                source: router.name + "-2",
                                target: router.name,
                                weight: 1
                            });
                        }
                        if (!nodes[router.srcIp]) {
                            nodes[router.srcIp] = {
                                category: "服务器",
                                name: router.srcIp,
                                value: 5
                            };
                            linkList.push({
                                source: router.srcIp,
                                target: router.name + "-1",
                                weight: 1
                            });
                            routerRef[router.srcIp] = router.name + "-1";
                        }
                        if (!nodes[router.dstIp]) {
                            nodes[router.dstIp] = {
                                category: "服务器",
                                name: router.dstIp,
                                value: 5
                            };
                            linkList.push({
                                source: router.dstIp,
                                target: router.name + "-2",
                                weight: 1
                            });
                            routerRef[router.dstIp] = router.name + "-2";
                        }
                    }
                    for (var i = 0; i < data.ips.length; i++) {
                        var record = data.ips[i];
                        if (!nodes[record.srcIp] && routerRef[record.dstIp]) {
                            nodes[record.srcIp] = {
                                category: "服务器",
                                name: record.srcIp,
                                value: 5
                            };
                            linkList.push({
                                source: record.srcIp,
                                target: routerRef[record.dstIp],
                                weight: 1
                            });
                        }
                    }
                    var nodeList = [];
                    for (var name in nodes) {
                        nodeList.push(nodes[name]);
                    }
                    $scope.deviceNodes = nodeList;
                    $scope.deviceLinks = linkList;
                }
                else {
                    $scope.deviceNodes = null;
                    $scope.deviceLinks = null;
                }
                if ($scope.deviceTabActive)
                    $scope.showDeviceChart();
            });
        };

        $scope.showIpChart = function () {
            $scope.ipTabActive = true;
            $scope.deviceTabActive = false;
            option.legend.data = $scope.ipLegend;
            option.series[0].categories = [];
            for (var item in $scope.ipLegend) {
                option.series[0].categories.push({ name: item });
            }
            option.series[0].nodes = $scope.ipNodes;
            option.series[0].links = $scope.ipLinks;
            $scope.topologyChart.setOption(option);
        };

        $scope.showDeviceChart = function () {
            $scope.ipTabActive = false;
            $scope.deviceTabActive = true;
            option.legend.data = $scope.deviceLegend;
            option.series[0].categories = [];
            for (var item in $scope.deviceLegend) {
                option.series[0].categories.push({ name: item });
            }
            option.series[0].nodes = $scope.deviceNodes;
            option.series[0].links = $scope.deviceLinks;
            $scope.topologyChart.setOption(option);
        };

        //获取url查询参数
        $scope.setSearchParams();
        $scope.queryTopology();
        //初始化图表
        $timeout(function () {
            $scope.topologyChart = echarts.init($("#ipTopology_chart").get(0));
        });
    });
});