define([
  'angular',
  'app',
  'lodash'
],
function (angular, app, _) {
    'use strict';

    angular.module('app.directives').directive('serverViewIpChart', function ($compile, $window, $timeout) {
        return {
            restrict: 'C',
            link: function ($scope, elem) {
                var render = function () {
                    var record = $scope.record, chartDataFlow = [], chartDataPackage = [];
                    if (!record.time)
                        return;
                    for (var i = 0; i < record.time.length; i++) {
                        if (typeof record.time[i] === "number")
                            record.time[i] = new Date(record.time[i]);
                    }
                    if (record && record.upFlow) {
                        var chartData = [];
                        for (var i = 0; i < record.upFlow.length; i++) {
                            if (!record.time || i >= record.time.length)
                                break;
                            chartData.push({ time: record.time[i], value: record.upFlow[i] });
                        }
                        chartDataFlow.push(chartData);
                    }
                    else {
                        chartDataFlow.push([]);
                    }
                    if (record && record.downFlow) {
                        var chartData = [];
                        for (var i = 0; i < record.downFlow.length; i++) {
                            if (!record.time || i >= record.time.length)
                                break;
                            chartData.push({ time: record.time[i], value: record.downFlow[i] });
                        }
                        chartDataFlow.push(chartData);
                    }
                    else {
                        chartDataFlow.push([]);
                    }
                    if (record && record.flow) {
                        var chartData = [];
                        for (var i = 0; i < record.flow.length; i++) {
                            if (!record.time || i >= record.time.length)
                                break;
                            chartData.push({ time: record.time[i], value: record.flow[i] });
                        }
                        chartDataFlow.push(chartData);
                    }
                    else {
                        chartDataFlow.push([]);
                    }
                    if (record && record.upPackage) {
                        var chartData = [];
                        for (var i = 0; i < record.upPackage.length; i++) {
                            if (!record.time || i >= record.time.length)
                                break;
                            chartData.push({ time: record.time[i], value: record.upPackage[i] });
                        }
                        chartDataPackage.push(chartData);
                    }
                    else {
                        chartDataPackage.push([]);
                    }
                    if (record && record.downPackage) {
                        var chartData = [];
                        for (var i = 0; i < record.downPackage.length; i++) {
                            if (!record.time || i >= record.time.length)
                                break;
                            chartData.push({ time: record.time[i], value: record.downPackage[i] });
                        }
                        chartDataPackage.push(chartData);
                    }
                    else {
                        chartDataPackage.push([]);
                    }
                    if (record && record.package) {
                        var chartData = [];
                        for (var i = 0; i < record.package.length; i++) {
                            if (!record.time || i >= record.time.length)
                                break;
                            chartData.push({ time: record.time[i], value: record.package[i] });
                        }
                        chartDataPackage.push(chartData);
                    }
                    else {
                        chartDataPackage.push([]);
                    }
                    MG.data_graphic({
                        legend: ['流出', '流入', '总'],
                        data: chartDataFlow,
                        width: 400,
                        height: 170,
                        right: 40,
                        top: 20,
                        mouseover: function (d, i) {
                            //custom format the rollover text, show days
                            var str = (d.time instanceof Date ? d.time.Format("hh:mm:ss") + " " : "") + (d.value || 0) + "kbps";
                            elem.find("[data-type=chart-flow] svg .mg-active-datapoint").html(str);
                        },
                        target: elem.find("[data-type=chart-flow]").get(0),
                        //linked: true,
                        x_accessor: 'time',
                        y_accessor: 'value'
                    });
                    MG.data_graphic({
                        legend: ['流出', '流入', '总'],
                        data: chartDataPackage,
                        width: 400,
                        height: 170,
                        right: 40,
                        top: 20,
                        mouseover: function (d, i) {
                            //custom format the rollover text, show days
                            var str = (d.time instanceof Date ? d.time.Format("hh:mm:ss") + " " : "") + (d.value || 0) + "pps";
                            elem.find("[data-type=chart-package] svg .mg-active-datapoint").html(str);
                        },
                        target: elem.find("[data-type=chart-package]").get(0),
                        //linked: true,
                        x_accessor: 'time',
                        y_accessor: 'value'
                    });
                };
                $scope.$watch("record.time", function () {
                    render();
                });
            }
        };
    });
});