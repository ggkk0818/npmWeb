define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/deviceStatistic.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('IpTopologyCtrl', function ($rootScope, $scope, $route, $timeout, $location, statisticService, warningService) {
        //初始化变量
        $scope.DURATION_TYPE = [
            { id: "minute", name: "1分钟" },
            { id: "hour", name: "1小时" },
            { id: "day", name: "1天" }
        ];
        $scope.startTime = null;
        $scope.durationType = $scope.DURATION_TYPE[0];
        //表单数据
        $scope.startTimeInput = $scope.startTime = new Date().Format("yyyy-MM-dd hh:mm:00");
        //图表变量
        $scope.topologyChart = null;
        //获取查询参数
        $scope.getSearchParams = function () {
            var params = {};
            if ($scope.startTime)
                params.startTime = $scope.startTime;
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
                $scope.startTime = params.startTime;
                $scope.startTimeInput = params.startTime;
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

        $scope.queryIpTopology = function () {
            var params = {
                start: 0,
                limit: 0
            };
            if ($scope.startTime) {
                params.starttime = $scope.startTime;
            }
            if ($scope.startTime && $scope.durationType) {
                var endTime = new Date($scope.startTime.replace(/-/g, "/")),
                    durationId = $scope.durationType.id;
                if (durationId == "minute") {
                    endTime.setMinutes(endTime.getMinutes() + 1);
                }
                else if (durationId == "hour") {
                    endTime.setHours(endTime.getHours() + 1);
                }
                else if (durationId == "day") {
                    endTime.setDate(endTime.getDate() + 1);
                }
                params.endtime = endTime.Format("yyyy-MM-dd hh:mm:ss");
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
                            var srcIp = arr[0] + "-" + arr[2],
                                dstIp = arr[1] + "-" + arr[2];
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
                                weight: 1
                            });
                        }
                    }
                    var nodeList = [];
                    for (var name in nodes) {
                        nodeList.push(nodes[name]);
                    }
                    option.series[0].nodes = nodeList;
                    option.series[0].links = linkList;
                    $scope.topologyChart.setOption(option);
                }
            });
        };

        //获取url查询参数
        $scope.setSearchParams();
        $scope.queryIpTopology();
        //初始化图表
        $timeout(function () {
            $scope.topologyChart = echarts.init($("#ipTopology_chart").get(0));
        });
    });
});