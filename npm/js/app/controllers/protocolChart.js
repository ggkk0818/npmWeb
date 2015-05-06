define(['angular', 'lodash', 'jquery', 'services/all'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('ProtocolChartCtrl', function ($rootScope, $scope, $route, $timeout, $location, protocolChartService, warningService) {
        //初始化变量
        $scope.PROTOCOL_TYPE = [
            { id: "8583", name: "8583", warnId: "iso8583" },
            { id: "20022", name: "20022", warnId: "iso20022" },
            { id: "http", name: "http", warnId: "http" },
            { id: "mysql", name: "mysql", warnId: "mysql" }
        ];
        $scope.DURATION_TYPE = [
            { id: "minute", name: "1分钟" },
            { id: "hour", name: "1小时" },
            { id: "day", name: "1天" }
        ];
        $scope.startTime = null;
        $scope.protocolType = $scope.PROTOCOL_TYPE[0];
        $scope.durationType = $scope.DURATION_TYPE[0];
        //表单数据
        $scope.startTimeInput = $scope.startTime = new Date().Format("yyyy-MM-dd hh:mm:00");
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
            if ($route.current.params.protocol) {
                for (var i = 0; i < $scope.PROTOCOL_TYPE.length; i++) {
                    if ($route.current.params.protocol == $scope.PROTOCOL_TYPE[i].id)
                        $scope.protocolType = $scope.PROTOCOL_TYPE[i];
                }
            }
            if (params.durationType) {
                for (var i = 0; i < $scope.DURATION_TYPE.length; i++) {
                    if (params.durationType == $scope.DURATION_TYPE[i].id)
                        $scope.durationType = $scope.DURATION_TYPE[i];
                }
            }
        };
        //初始化方法
        $scope.init = function () {
            if (!$scope.protocolType) {
                return;
            }
            var flow_data = [];
            var suc_ratio = [];
            var resp_ratio = [];
            var axis_data = [];
            var code_legend_data = [];
            var code_data = [];
            var warn_data_s0 = [];
            var warn_data_s1 = [];
            var warn_data_s2 = [];
            var warn_data_s3 = [];
            var warn_data_s5 = [];
            var warn_data_s6 = [];
            var warn_data_s7 = [];

            var flow_chart = null;
            var flow_option = null;
            var resp_chart = null;
            var resp_option = null;
            var code_chart = null;
            var code_option = null;
            var warn_chart = null;
            var warn_option = null;

            var params = {
                type: $scope.protocolType.id
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
            protocolChartService.flowList(params, function (data) {
                if (!data || !data.data) {
                    return;
                }
                for (var i = 0; i < data.data.length; i++) {
                    var d = data.data[i];
                    flow_data.push({value: [d.time, d.allflow]});

                    axis_data.push(new Date(d.time).Format("hh:mm:ss"));
                    suc_ratio.push(d.successRatio);
                    resp_ratio.push(d.responseRatio);

                }
                // 折线图
                flow_option = {
                    animation: true,
                    title: {
                        text: '流量'
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
                        data: ['流量']
                    },
                    toolbox: {
                        show: true,
                        feature: {
                            mark: {show: true},
                            dataView: {show: true, readOnly: false},
                            restore: {show: true},
                            saveAsImage: {show: true}
                        }
                    },
                    calculable: true,
                    xAxis: [
                        {
                            type: 'time'
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value'
                        }
                    ],
                    series: [{
                        name: '流量',
                        type: 'line',
                        data: flow_data,
                        markLine: {
                            data: [
                                {type: 'average', name: '平均值'}
                            ]
                        }
                    }]
                };

                // 柱状图
                resp_option = {
                    title: {
                        text: '响应率/成功率'
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    legend: {
                        data: ['成功率', '响应率']
                    },
                    toolbox: {
                        show: true,
                        feature: {
                            mark: {show: true},
                            dataView: {show: true, readOnly: false},
                            magicType: {show: true, type: ['line', 'bar']},
                            restore: {show: true},
                            saveAsImage: {show: true}
                        }
                    },
                    calculable: true,
                    xAxis: [
                        {
                            type: 'category',
                            data: axis_data
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value'
                        }
                    ],
                    series: [{
                        name: '成功率',
                        type: 'bar',
                        markPoint: {
                            data: [
                                {type: 'max', name: '最大值'},
                                {type: 'min', name: '最小值'}
                            ]
                        },
                        markLine: {
                            data: [
                                {type: 'average', name: '平均值'}
                            ]
                        },
                        data: suc_ratio
                    }, {
                        name: '响应率',
                        type: 'bar',
                        markPoint: {
                            data: [
                                {type: 'max', name: '最大值'},
                                {type: 'min', name: '最小值'}
                            ]
                        },
                        markLine: {
                            data: [
                                {type: 'average', name: '平均值'}
                            ]
                        },
                        data: resp_ratio
                    }]
                };
                $timeout(function () {
                    flow_chart = echarts.init($("#flow")[0], "blue").setOption(flow_option);
                    resp_chart = echarts.init($("#resp")[0], "blue").setOption(resp_option);
                });
            });

            protocolChartService.codeList(params, function (data) {
                if (!data || !data.data) {
                    return;
                }
                for (var i = 0; i < data.data.length; i++) {
                    var d = data.data[i];
                    var code = d.responseCode
                    if (typeof code === "number") {
                        code_legend_data.push(d.responseCode);
                        code_data.push({value: d.count, name: d.responseCode});
                    }
                }
                code_option = {
                    title: {
                        text: '返回状态码',
                        x: 'center'
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b} : {c} ({d}%)"
                    },
                    legend: {
                        orient: 'vertical',
                        x: 'left',
                        data: code_legend_data
                    },
                    toolbox: {
                        show: true,
                        feature: {
                            mark: {show: true},
                            dataView: {show: true, readOnly: false},
                            magicType: {
                                show: true,
                                type: ['pie', 'funnel'],
                                option: {
                                    funnel: {
                                        x: '25%',
                                        width: '50%',
                                        funnelAlign: 'left',
                                        max: 1548
                                    }
                                }
                            },
                            restore: {show: true},
                            saveAsImage: {show: true}
                        }
                    },
                    calculable: true,
                    series: [
                        {
                            name: '访问来源',
                            type: 'pie',
                            radius: '55%',
                            center: ['50%', '60%'],
                            data: code_data
                        }
                    ]
                };

                $timeout(function () {
                    code_chart = echarts.init($("#code")[0], "blue").setOption(code_option);
                });
            });

            warningService.list({
                type: $scope.protocolType.warnId,
                startWarnTime: params.starttime,
                endWarnTime: params.endtime,
                start: 0,
                limit: 0
            }, function (data) {
                if (!data || !data.data) {
                    return;
                }
                warn_data_s0 = [];
                warn_data_s1 = [];
                warn_data_s2 = [];
                warn_data_s3 = [];
                warn_data_s6 = [];
                warn_data_s7 = [];
                for (var i = 0; i < data.data.length; i++) {
                    var warn = data.data[i];
                    warn.value = [warn.warnTime, warn.respmills, warn.protocol, warn.src_ip, warn.dest_ip];
                    var status = warn.status;
                    if (status == 0) {
                        warn_data_s0.push(warn);
                    } else if (status == 1) {
                        warn_data_s1.push(warn);
                    } else if (status == 2) {
                        warn_data_s2.push(warn);
                    } else if (status == 3) {
                        warn_data_s3.push(warn);
                    } else if (status == 6) {
                        warn_data_s6.push(warn);
                    } else if (status == 7) {
                        warn_data_s7.push(warn);
                    }
                }
                warn_option = {
                    animation: false,
                    title: {
                        text: '告警'
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    legend: {
                        data: ['status0', 'status1', 'status2', 'status3', 'status6', 'status7']
                    },
                    //dataRange: {
                    //    min: 0,
                    //    max: 7,
                    //    orient: 'horizontal',
                    //    y: 30,
                    //    x: 'center',
                    //    //text:['高','低'],           // 文本，默认为数值文本
                    //    color: ['lightgreen', 'orange'],
                    //    splitNumber: 8
                    //},
                    toolbox: {
                        show: true,
                        feature: {
                            mark: {show: true},
                            dataView: {show: true, readOnly: false},
                            restore: {show: true},
                            saveAsImage: {show: true}
                        }
                    },
                    //dataZoom: {
                    //    show: true,
                    //    start : 30,
                    //    end : 70
                    //},
                    xAxis: [
                        {
                            type: 'time'
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value',
                            splitNumber: 5,
                            scale: true
                        }
                    ],
                    series: [{
                        name: 'status0',
                        type: 'scatter',
                        symbolSize: function (value) {
                            return 5;
                        },
                        tooltip: {
                            trigger: 'axis',
                            formatter: function (params) {
                                var date = new Date(params.value[0]);
                                return params.seriesName
                                    + ' （'
                                    + date.getFullYear() + '-'
                                    + (date.getMonth() + 1) + '-'
                                    + date.getDate() + ' '
                                    + date.getHours() + ':'
                                    + date.getMinutes()
                                    + '）<br/>'
                                    + '时延: ' + params.value[1] + ' ms<br/>'
                                    + '协议: ' + params.value[2] + '<br/> '
                                    + '源IP: ' + params.value[3] + '<br/>'
                                    + '目的IP: ' + params.value[4] + '<br/>';
                            },
                            axisPointer: {
                                type: 'cross',
                                lineStyle: {
                                    type: 'dashed',
                                    width: 1
                                }
                            }
                        },
                        data: warn_data_s0
                    }, {
                        name: 'status1',
                        type: 'scatter',
                        symbolSize: function (value) {
                            return 5;
                        },
                        tooltip: {
                            trigger: 'axis',
                            formatter: function (params) {
                                var date = new Date(params.value[0]);
                                return params.seriesName
                                    + ' （'
                                    + date.getFullYear() + '-'
                                    + (date.getMonth() + 1) + '-'
                                    + date.getDate() + ' '
                                    + date.getHours() + ':'
                                    + date.getMinutes()
                                    + '）<br/>'
                                    + '时延: ' + params.value[1] + ' ms<br/>'
                                    + '协议: ' + params.value[2] + '<br/> '
                                    + '源IP: ' + params.value[3] + '<br/>'
                                    + '目的IP: ' + params.value[4] + '<br/>';
                            },
                            axisPointer: {
                                type: 'cross',
                                lineStyle: {
                                    type: 'dashed',
                                    width: 1
                                }
                            }
                        },
                        data: warn_data_s1
                    }, {
                        name: 'status2',
                        type: 'scatter',
                        symbolSize: function (value) {
                            return 5;
                        },
                        tooltip: {
                            trigger: 'axis',
                            formatter: function (params) {
                                var date = new Date(params.value[0]);
                                return params.seriesName
                                    + ' （'
                                    + date.getFullYear() + '-'
                                    + (date.getMonth() + 1) + '-'
                                    + date.getDate() + ' '
                                    + date.getHours() + ':'
                                    + date.getMinutes()
                                    + '）<br/>'
                                    + '时延: ' + params.value[1] + ' ms<br/>'
                                    + '协议: ' + params.value[2] + '<br/> '
                                    + '源IP: ' + params.value[3] + '<br/>'
                                    + '目的IP: ' + params.value[4] + '<br/>';
                            },
                            axisPointer: {
                                type: 'cross',
                                lineStyle: {
                                    type: 'dashed',
                                    width: 1
                                }
                            }
                        },
                        data: warn_data_s2
                    }, {
                        name: 'status3',
                        type: 'scatter',
                        symbolSize: function (value) {
                            return 5;
                        },
                        tooltip: {
                            trigger: 'axis',
                            formatter: function (params) {
                                var date = new Date(params.value[0]);
                                return params.seriesName
                                    + ' （'
                                    + date.getFullYear() + '-'
                                    + (date.getMonth() + 1) + '-'
                                    + date.getDate() + ' '
                                    + date.getHours() + ':'
                                    + date.getMinutes()
                                    + '）<br/>'
                                    + '时延: ' + params.value[1] + ' ms<br/>'
                                    + '协议: ' + params.value[2] + '<br/> '
                                    + '源IP: ' + params.value[3] + '<br/>'
                                    + '目的IP: ' + params.value[4] + '<br/>';
                            },
                            axisPointer: {
                                type: 'cross',
                                lineStyle: {
                                    type: 'dashed',
                                    width: 1
                                }
                            }
                        },
                        data: warn_data_s3
                    }, {
                        name: 'status6',
                        type: 'scatter',
                        symbolSize: function (value) {
                            return 5;
                        },
                        tooltip: {
                            trigger: 'axis',
                            formatter: function (params) {
                                var date = new Date(params.value[0]);
                                return params.seriesName
                                    + ' （'
                                    + date.getFullYear() + '-'
                                    + (date.getMonth() + 1) + '-'
                                    + date.getDate() + ' '
                                    + date.getHours() + ':'
                                    + date.getMinutes()
                                    + '）<br/>'
                                    + '时延: ' + params.value[1] + ' ms<br/>'
                                    + '协议: ' + params.value[2] + '<br/> '
                                    + '源IP: ' + params.value[3] + '<br/>'
                                    + '目的IP: ' + params.value[4] + '<br/>';
                            },
                            axisPointer: {
                                type: 'cross',
                                lineStyle: {
                                    type: 'dashed',
                                    width: 1
                                }
                            }
                        },
                        data: warn_data_s6
                    }, {
                        name: 'status7',
                        type: 'scatter',
                        symbolSize: function (value) {
                            return 5;
                        },
                        tooltip: {
                            trigger: 'axis',
                            formatter: function (params) {
                                var date = new Date(params.value[0]);
                                return params.seriesName
                                    + ' （'
                                    + date.getFullYear() + '-'
                                    + (date.getMonth() + 1) + '-'
                                    + date.getDate() + ' '
                                    + date.getHours() + ':'
                                    + date.getMinutes()
                                    + '）<br/>'
                                    + '时延: ' + params.value[1] + ' ms<br/>'
                                    + '协议: ' + params.value[2] + '<br/> '
                                    + '源IP: ' + params.value[3] + '<br/>'
                                    + '目的IP: ' + params.value[4] + '<br/>';
                            },
                            axisPointer: {
                                type: 'cross',
                                lineStyle: {
                                    type: 'dashed',
                                    width: 1
                                }
                            }
                        },
                        data: warn_data_s7
                    }]
                };
                $timeout(function () {
                    warn_chart = echarts.init($("#warn")[0], "blue").setOption(warn_option);
                });
            });

        };
        //搜索
        $scope.search = function () {
            if (typeof $scope.startTimeInput == "undefined" || $scope.startTimeInput == null || $scope.startTimeInput.length == 0)
                $scope.startTime = null;
            else
                $scope.startTime = $scope.startTimeInput;
            var params = $scope.getSearchParams();
            if (_.isEqual(params, $location.search()))
                params.refresh = true;
            var path = "/protocolChart/" + $scope.protocolType.id;
            $location.path(path).search(params);
        };
        //表单输入框按键事件
        $scope.formKeypressHandler = function (e) {
            if (e.keyCode == 13) {
                $scope.search();
            }
        };
        //获取url查询参数
        $scope.setSearchParams();
        //执行初始化
        $scope.init();
    });
});