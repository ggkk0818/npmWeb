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
        $scope.startDateInput = $scope.startDate = dateTimeService.serverTime.Format("yyyy-MM-dd");
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
                    effect: {
                        show: true,
                        shadowBlur: 0
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
                    if ($scope.ipLegend) {
                        for (var i = 0; i < $scope.ipLegend.length; i++) {
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
                    $scope.ipNodes = nodeList;
                    $scope.ipLinks = linkList;
                }
                else {
                    $scope.ipNodes = null;
                    $scope.ipLinks = null;
                }
                if ($scope.ipTabActive)
                    $scope.showIpChart();
            });
            statisticService.relationTopology(params, function (data) {
                if (data && data.route && data.relation) {
                    var nodes = {}, linkList = [], routers = {}, routerRef = {};
                    //路由器交换机和根ip节点
                    for (var i = 0; i < data.route.length; i++) {
                        var router = data.route[i];
                        if (!nodes[router.device]) {
                            nodes[router.device] = {
                                category: 0,
                                name: router.device,
                                value: 10
                            };
                            nodes[router.device + "-switch"] = {
                                category: 1,
                                name: router.device + "-switch",
                                value: 8
                            };
                            //nodes[router.device + "-2"] = {
                            //    category: 1,
                            //    name: router.device + "-2",
                            //    value: 8
                            //};
                            linkList.push({
                                source: router.device + "-switch",
                                target: router.device,
                                weight: 1
                            });
                            //linkList.push({
                            //    source: router.device + "-2",
                            //    target: router.device,
                            //    weight: 1
                            //});
                        }
                        if (!nodes[router.source_ip]) {
                            nodes[router.source_ip] = {
                                category: 2,
                                name: router.source_ip,
                                value: 5
                            };
                            linkList.push({
                                source: router.source_ip,
                                target: router.device + "-switch",
                                weight: 1
                            });
                            routerRef[router.source_ip] = router.device + "-switch";
                        }
                        //if (!nodes[router.dest_ip]) {
                        //    nodes[router.dest_ip] = {
                        //        category: 2,
                        //        name: router.dest_ip,
                        //        value: 5
                        //    };
                        //    linkList.push({
                        //        source: router.dest_ip,
                        //        target: router.device + "-2",
                        //        weight: 1
                        //    });
                        //    routerRef[router.dest_ip] = router.device + "-2";
                        //}
                        if (!routers[router.device]) {
                            routers[router.device] = router;
                        }
                    }
                    //其他ip节点
                    for (var i = 0; i < data.relation.length; i++) {
                        var arr = data.relation[i] ? data.relation[i].split("->") : null;
                        if (arr && arr.length >= 2) {
                            var record = { srcIp: arr[0], dstIp: arr[1] };
                            if (!nodes[record.srcIp] && routerRef[record.dstIp]) {
                                nodes[record.srcIp] = {
                                    category: 2,
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
                    }
                    //路由器之间连线
                    var firstRouter = null, prevRouter = null;
                    for (var routerName in routers) {
                        if (!firstRouter)
                            firstRouter = routerName;
                        if (prevRouter) {
                            linkList.push({
                                source: routerName,
                                target: prevRouter,
                                weight: 1
                            });
                        }
                        prevRouter = routerName;
                    }
                    if (firstRouter) {
                        linkList.push({
                            source: firstRouter,
                            target: routerName,
                            weight: 1
                        });
                    }
                    //生成node与link列表
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
            for (var index in $scope.ipLegend) {
                option.series[0].categories.push({ name: $scope.ipLegend[index] });
            }
            option.series[0].nodes = $scope.ipNodes;
            option.series[0].links = $scope.ipLinks;
            $scope.topologyChart = echarts.init($("#ipTopology_chart").get(0));
            $scope.topologyChart.setOption(option);
        };

        $scope.showDeviceChart = function () {
            $scope.ipTabActive = false;
            $scope.deviceTabActive = true;
            option.legend.data = $scope.deviceLegend;
            option.series[0].categories = [];
            for (var index in $scope.deviceLegend) {
                option.series[0].categories.push({ name: $scope.deviceLegend[index] });
            }
            option.series[0].nodes = $scope.deviceNodes;
            option.series[0].links = $scope.deviceLinks;
            $scope.topologyChart = echarts.init($("#ipTopology_chart").get(0));
            $scope.topologyChart.setOption(option);
        };

        //获取url查询参数
        $scope.setSearchParams();
        $scope.queryTopology();
        //初始化图表
        //$timeout(function () {
        //    $scope.topologyChart = echarts.init($("#ipTopology_chart").get(0));
        //});
    });
});