﻿define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/protocol.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('ProtocolCtrl', function ($rootScope, $scope, $route, $timeout, $location, protocolService, protocolChartService, warningService) {
        //初始化变量
        $scope.FIELD_LIST = {};
        $scope.FIELD_OPT = {
            "String": [
                { name: "=", displayName: "等于" },
                { name: "!=", displayName: "不等于" },
                { name: "like", displayName: "包含" }
            ],
            "Date": [
                { name: "=", displayName: "等于" },
                { name: ">=", displayName: ">=" },
                { name: "<=", displayName: "<=" },
                { name: "><", displayName: "介于" }
            ],
            "Int": [
                { name: "=", displayName: "等于" },
                { name: "!=", displayName: "不等于" },
                { name: "><", displayName: "介于" }
            ],
            "Byte": [
                { name: "=", displayName: "等于" },
                { name: "!=", displayName: "不等于" }
            ],
        };
        $scope.queryFieldList = {};
        $scope.groupFieldList = {};
        $scope.groupFieldCount = 0;
        $scope.displayFieldList = {};
        //普通查询变量
        $scope.pageNum = 1;
        $scope.pageTotal = 1;
        $scope.pageSize = 10;
        $scope.recordSize = 0;
        $scope.recordList = null;
        //分组查询变量
        $scope.groupRecordList = {};
        $scope.isGroupMode = false;
        //图表变量
        $scope.DURATION_TYPE = [
            { id: "minute", name: "1分钟" },
            { id: "hour", name: "1小时" },
            { id: "day", name: "1天" }
        ];
        $scope.startTime = null;
        $scope.durationType = $scope.DURATION_TYPE[0];
        $scope.startTimeInput = $scope.startTime = new Date().Format("yyyy-MM-dd hh:mm:00");
        $scope.chart_flow = null;
        $scope.chart_resp = null;
        $scope.chart_code = null;
        $scope.chart_warn = null;

        $scope.protocolType = null;

        $scope.init = function () {
            if ($route.current.params.protocol) {
                $scope.protocolType = $route.current.params.protocol;
            }
            else {
                return;
            }
            protocolService.fields({ name: $scope.protocolType }, function (data) {
                if (data && data.fields) {
                    for (var i = 0; i < data.fields.length; i++) {
                        var field = data.fields[i];
                        $scope.FIELD_LIST[field.name] = field;
                        $scope.displayFieldList[field.name] = field;
                    }
                }
            });
            $timeout(function () {
                $scope.chart_flow = echarts.init($("#protocol-chart-flow").get(0), "blue");
                $scope.chart_resp = echarts.init($("#protocol-chart-resp").get(0), "blue");
                $scope.chart_code = echarts.init($("#protocol-chart-code").get(0), "blue");
                $scope.chart_warn = echarts.init($("#protocol-chart-warn").get(0), "blue");
            });
        };
        //配置过滤器方法
        $scope.addFilter = function (field) {
            if (field)
                $scope.queryFieldList[field.name] = field;
        };
        $scope.removeFilter = function (field) {
            if (field)
                delete $scope.queryFieldList[field.name];
        };
        //配置分组方法
        $scope.toggleGroup = function (field) {
            if (field) {
                if($scope.groupFieldList[field.name])
                    delete $scope.groupFieldList[field.name];
                else
                    $scope.groupFieldList[field.name] = field;
                $scope.groupFieldCount = getGroupFieldCount();
            }
        };
        var getGroupFieldCount = function () {
            var r = 0;
            for (var index in $scope.groupFieldList)
                r++;
            return r;
        };
        //配置显示字段方法
        $scope.toggleDisplayField = function (field) {
            if (!field)
                return;
            if (!$scope.displayFieldList[field.name])
                $scope.displayFieldList[field.name] = field;
            else
                delete $scope.displayFieldList[field.name];
        };

        $scope.reset = function () {
            $scope.queryFieldList = {};
            $scope.groupFieldList = {};
            $scope.groupFieldCount = 0;
            $scope.displayFieldList = {};
        };
        //普通查询
        $scope.doQuery = function (pageNum) {
            if (pageNum)
                $scope.pageNum = pageNum;
            var params = {
                start: ($scope.pageNum - 1) * $scope.pageSize,
                limit: $scope.pageSize,
                name: $scope.protocolType
            };
            if ($scope.queryFieldList) {
                var i = 0;
                for (var name in $scope.queryFieldList) {
                    var field = $scope.queryFieldList[name];
                    if (!field.opt)
                        continue;
                    params["fields[" + i + "]"] = name;
                    params["opts[" + name + "]"] = field.opt.name;
                    if (typeof field.inputValue1 === "string")
                        params["values[" + name + "][0]"] = field.inputValue1;
                    if (typeof field.inputValue1 === "string" && typeof field.inputValue2 === "string")
                        params["values[" + name + "][1]"] = field.inputValue2;
                    params["types[" + name + "]"] = field.type;
                    i++;
                }
            }
            protocolService.list(params, function (data) {
                if (data) {
                    $scope.recordList = data && data.data ? data.data : [];
                    $scope.recordSize = data && data.count ? data.count : 0;
                    $scope.pageTotal = Math.floor($scope.recordSize / $scope.pageSize) + ($scope.recordSize % $scope.pageSize > 0 ? 1 : 0);
                }
            });
        };
        //分组查询
        $scope.doGroup = function (pageNum) {
            if (pageNum)
                $scope.pageNum = pageNum;
            var params = {
                start: ($scope.pageNum - 1) * $scope.pageSize,
                limit: $scope.pageSize,
                name: $scope.protocolType
            };
            if ($scope.queryFieldList) {
                var i = 0;
                for (var name in $scope.queryFieldList) {
                    var field = $scope.queryFieldList[name];
                    if (!field.opt)
                        continue;
                    params["fields[" + i + "]"] = name;
                    params["opts[" + name + "]"] = field.opt.name;
                    if (typeof field.inputValue1 === "string")
                        params["values[" + name + "][0]"] = field.inputValue1;
                    if (typeof field.inputValue1 === "string" && typeof field.inputValue2 === "string")
                        params["values[" + name + "][1]"] = field.inputValue2;
                    params["types[" + name + "]"] = field.type;
                    i++;
                }
            }
            if ($scope.groupFieldList) {
                var arr = [];
                for (var name in $scope.groupFieldList) {
                    arr.push(name);
                }
                params.groupBy = arr.join(",");
            }
            protocolService.group(params, function (data) {
                if (data) {
                    $scope.recordList = data && data.data ? data.data : [];
                    $scope.recordSize = data && data.count ? data.count : 0;
                    $scope.pageTotal = Math.floor($scope.recordSize / $scope.pageSize) + ($scope.recordSize % $scope.pageSize > 0 ? 1 : 0);
                }
            });
        };
        //分组详细查询
        $scope.toggleGroupDetailTable = function (record) {
            record.showTable = !record.showTable;
            if (!record.subRecordList) {
                $scope.groupQuery(1, record.groupfield);
            }
        };
        $scope.groupQuery = function (pageNum, groupField) {
            var group = null;
            for (var i = 0; i < $scope.recordList.length; i++) {
                var record = $scope.recordList[i];
                if (record.groupfield == groupField) {
                    group = record;
                    break;
                }
            }
            if (!group)
                return;
            if (pageNum)
                group.pageNum = pageNum;
            var groupValueArr = groupField.split(",");
            var params = {
                start: (group.pageNum - 1) * $scope.pageSize,
                limit: $scope.pageSize,
                name: $scope.protocolType
            };
            var queryFieldList = _.clone($scope.queryFieldList, true) || {};
            if ($scope.groupFieldList) {
                var groupIndex = 0;
                for (var name in $scope.groupFieldList) {
                    if (groupIndex >= groupValueArr.length)
                        break;
                    var field = $scope.groupFieldList[name];
                    queryFieldList[name] = { name: field.name, type: field.type, opt: { name: groupValueArr[groupIndex] === "NULL" ? "isnull" : "=" }, inputValue1: groupValueArr[groupIndex] };
                    groupIndex++;
                }
            }
            if (queryFieldList) {
                var i = 0;
                for (var name in queryFieldList) {
                    var field = queryFieldList[name];
                    if (!field.opt)
                        continue;
                    params["fields[" + i + "]"] = name;
                    params["opts[" + name + "]"] = field.opt.name;
                    if (typeof field.inputValue1 === "string")
                        params["values[" + name + "][0]"] = field.inputValue1;
                    if (typeof field.inputValue1 === "string" && typeof field.inputValue2 === "string")
                        params["values[" + name + "][1]"] = field.inputValue2;
                    params["types[" + name + "]"] = field.type;
                    i++;
                }
            }
            protocolService.list(params, function (data) {
                if (data) {
                    group.subRecordList = data && data.data ? data.data : [];
                    group.recordSize = data && data.count ? data.count : 0;
                    group.pageTotal = Math.floor(group.recordSize / $scope.pageSize) + (group.recordSize % $scope.pageSize > 0 ? 1 : 0);
                }
            });
        };

        $scope.applyFilter = function () {
            if ($scope.groupFieldCount) {
                $scope.isGroupMode = true;
                $scope.doGroup(1);
            }
            else {
                $scope.groupRecordList = {};
                $scope.isGroupMode = false;
                $scope.doQuery(1);
            }
        };
        // 折线图
        var flow_option = {
            animation: true,
            title: {
                text: '流量/交易量/平均时延'
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
                data: ['流量', '交易量', '平均时延']
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
                name: '流量',
                type: 'line',
                data: []
            }, {
                name: '交易量',
                type: 'line',
                yAxisIndex: 1,
                data: []
            }, {
                name: '平均时延',
                type: 'line',
                yAxisIndex: 1,
                data: []
            }]
        };
        // 柱状图
        var resp_option = {
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
                    mark: { show: true },
                    dataView: { show: true, readOnly: false },
                    magicType: { show: true, type: ['line', 'bar'] },
                    restore: { show: true },
                    saveAsImage: { show: true }
                }
            },
            calculable: true,
            xAxis: [
                {
                    type: 'category',
                    data: []
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
                //markPoint: {
                //    data: [
                //        { type: 'max', name: '最大值' },
                //        { type: 'min', name: '最小值' }
                //    ]
                //},
                //markLine: {
                //    data: [
                //        { type: 'average', name: '平均值' }
                //    ]
                //},
                data: []
            }, {
                name: '响应率',
                type: 'bar',
                //markPoint: {
                //    data: [
                //        { type: 'max', name: '最大值' },
                //        { type: 'min', name: '最小值' }
                //    ]
                //},
                //markLine: {
                //    data: [
                //        { type: 'average', name: '平均值' }
                //    ]
                //},
                data: []
            }]
        };
        //饼图
        var code_option = {
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
                data: []
            },
            toolbox: {
                show: true,
                feature: {
                    mark: { show: true },
                    dataView: { show: true, readOnly: false },
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
                    restore: { show: true },
                    saveAsImage: { show: true }
                }
            },
            calculable: true,
            series: [
                {
                    name: '访问来源',
                    type: 'pie',
                    radius: '55%',
                    center: ['50%', '60%'],
                    data: []
                }
            ]
        };
        var warn_option = {
            animation: false,
            title: {
                text: '告警'
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['延迟', '失败', '延迟并失败', '不完整']
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
            xAxis: [{
                type: 'time'
            }],
            yAxis: [{
                type: 'value',
                splitNumber: 5,
                scale: true,
                max: 5000
            }],
            series: [{
                name: '延迟',
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
                data: []
            }, {
                name: '失败',
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
                data: []
            }, {
                name: '延迟并失败',
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
                data: []
            }, {
                name: '不完整',
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
                data: []
            }]
        };

        //图表查询
        $scope.chartSearch = function () {
            if (typeof $scope.startTimeInput == "undefined" || $scope.startTimeInput == null || $scope.startTimeInput.length == 0)
                $scope.startTime = null;
            else
                $scope.startTime = $scope.startTimeInput;
            var params = {
                type: $scope.protocolType
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
                if (data && data.data) {
                    var flow_data = [],
                        count_data = [],
                        avgresp_data = [],
                        axis_data = [],
                        suc_ratio = [],
                        resp_ratio = [];
                    for (var i = 0; i < data.data.length; i++) {
                        var d = data.data[i];
                        flow_data.push({ value: [d.time, d.allflow] });
                        count_data.push({ value: [d.time, d.count] });
                        avgresp_data.push({ value: [d.time, d.avgDuration] });
                        axis_data.push(new Date(d.time).Format("hh:mm:ss"));
                        suc_ratio.push(d.successRatio);
                        resp_ratio.push(d.responseRatio);

                    }
                    flow_option.series[0].data = flow_data;
                    flow_option.series[1].data = count_data;
                    flow_option.series[2].data = avgresp_data;
                    resp_option.xAxis[0].data = axis_data.length ? axis_data : [""];
                    resp_option.series[0].data = suc_ratio;
                    resp_option.series[1].data = resp_ratio;
                    $scope.chart_flow.setOption(flow_option, true);
                    $scope.chart_resp.setOption(resp_option, true);
                }
            });
            protocolChartService.codeList(params, function (data) {
                if (data && data.data) {
                    var code_legend_data = [],
                        code_data = [];
                    for (var i = 0; i < data.data.length; i++) {
                        var d = data.data[i];
                        var code = d.responseCode
                        if (typeof code === "number") {
                            code_legend_data.push(d.responseCode);
                            code_data.push({ value: d.count, name: d.responseCode });
                        }
                    }
                    code_option.legend.data = code_legend_data;
                    code_option.series[0].data = code_data;
                    $scope.chart_code.setOption(code_option, true);
                }
            });
            warningService.list({
                type: $scope.protocolType == "8583" || $scope.protocolType == "20022" ? "iso" + $scope.protocolType : $scope.protocolType,
                startWarnTime: params.starttime,
                endWarnTime: params.endtime,
                start: 0,
                limit: 0
            }, function (data) {
                if (data && data.data) {
                    var warn_data_s2 = [],
                        warn_data_s3 = [],
                        warn_data_s1 = [],
                        warn_data_s7 = [];
                    for (var i = 0; i < data.data.length; i++) {
                        var warn = data.data[i];
                        warn.value = [warn.warnTime, warn.respmills, warn.protocol, warn.src_ip, warn.dest_ip];
                        var status = warn.status;
                        if (status == 1) {
                            warn_data_s1.push(warn);
                        } else if (status == 2) {
                            warn_data_s2.push(warn);
                        } else if (status == 3) {
                            warn_data_s3.push(warn);
                        } else if (status == 7) {
                            warn_data_s7.push(warn);
                        }
                    }
                    warn_option.series[0].data = warn_data_s2;
                    warn_option.series[1].data = warn_data_s3;
                    warn_option.series[2].data = warn_data_s1;
                    warn_option.series[3].data = warn_data_s7;
                    $scope.chart_warn.setOption(warn_option, true);
                }
            });
        };
        //表单输入框按键事件
        $scope.formKeypressHandler = function (e) {
            if (e.keyCode == 13) {
                $scope.chartSearch();
            }
        };
        
        //执行初始化
        $scope.init();
        $scope.chartSearch();
    });
});