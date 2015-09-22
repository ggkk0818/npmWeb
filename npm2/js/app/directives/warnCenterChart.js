define([
        'angular',
        'app',
        'lodash'
    ],
    function (angular, app, _) {
        'use strict';

        angular
            .module('app.directives')
            .directive('warnCenterChart', function ($compile, $window, $timeout) {
                return {
                    restrict: 'C',
                    link: function ($scope, elem) {
                        var render = function () {
                            var record = $scope.record, chartData = [], markerData = [], legendData = [];
                            if (record && record.flowData) {
                                //for (var i = 1330; i < 1931; i++) {
                                //    var date = new Date();
                                //    date.setDate(date.getDate() - (1931 - i));
                                //    chartData.push({ year: date.Format("yyyy-MM-dd hh:mm:ss"), sightings: Math.round(Math.random() * 10) });
                                //}
                                for (var i = 0; i < record.flowData.length; i++) {
                                    var d = record.flowData[i],
                                        datetime = new Date(d.datetime),
                                        total_flow = d.total_flow || 0;
                                    chartData.push({time: datetime, value: total_flow});
                                }
                                //chartData = MG.convert.date(chartData, 'time', '%Y-%m-%d %H:%M:%S');
                            }
                            if (record && record.comparisonData) {
                                for (var i = 0; i < record.comparisonData.length; i++) {
                                    var data = [];
                                    for (var j = 0; j < record.comparisonData[i].length; j++) {
                                        var d = record.comparisonData[i][j],
                                            datetime = new Date(d.datetime),
                                            ip_count = d.ip_count + 100 || 100,//两点数值相差比较大时，值为0的点可能会显示错误，所有点+100解决
                                            totalFlow = d.total_flow || 0;
                                        if (i == 0)
                                            datetime.setDate(datetime.getDate() + 1);
                                        data.push({time: datetime, value: record.type == 2 ? totalFlow : ip_count});
                                    }
                                    chartData.push(data);
                                }
                                legendData.push("昨日", "今日");
                            }
                            if (record && record.critical_info) {
                                var criticalArr = record.critical_info.split(",");
                                for (var i = 0; i < criticalArr.length; i++) {
                                    var date = new Date(criticalArr[i].replace(/-/g, "/"));
                                    if (!isNaN(date))
                                        markerData.push({time: date, label: "Warn"});
                                }
                            }
                            var options = {
                                data: chartData,
                                markers: markerData,
                                legend: legendData,
                                transition_on_update: true,
                                width: elem.width(),
                                height: 200,
                                buffer: 0,
                                top: 30,
                                right: 10,
                                bottom: 10,
                                left: 10,
                                target: elem.get(0),
                                mouseover: function (d, i) {
                                    //custom format the rollover text, show days
                                    var str = (d.time instanceof Date ? d.time.Format("hh:mm:ss") + " " : "") + (record.type == 3 ? d.value - 100 : d.value) + (record.type == 3 ? "个" : "kbps");
                                    elem.find('svg .mg-active-datapoint').html(str);
                                },
                                //brushing: false,
                                //missing_is_hidden: true,
                                x_axis: false,
                                y_axis: false,
                                x_accessor: 'time',
                                y_accessor: 'value'
                            };
                            if (record.type > 1) {
                                options.right = 30;
                            }
                            MG.data_graphic(options);
                        };
                        $timeout(function () {
                            render();
                            $(window).on("resize.warnCenterChart" + $scope.$id, function () {
                                render();
                            });
                        });
                    }
                };
            });
    });