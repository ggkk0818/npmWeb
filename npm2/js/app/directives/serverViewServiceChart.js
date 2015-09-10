define([
  'angular',
  'app',
  'lodash'
],
function (angular, app, _) {
    'use strict';

    angular.module('app.directives').directive('serverViewServiceChart', function ($compile, $window, $timeout) {
        return {
            restrict: 'C',
            link: function ($scope, elem) {
                var render = function () {
                    var record = $scope.record, chartData = [];
                    if (record && record.ratioList) {
                        var otherFlow = 0;
                        for (var i = 0; i < record.ratioList.length; i++) {
                            var detail = record.ratioList[i],
                                total_bytes = detail.flow || 0;
                            if (i < 4 || record.ratioList.length == 4)
                                chartData.push({ value: total_bytes, name: detail.protocol + ":" + detail.port });
                            else
                                otherFlow += total_bytes;
                        }
                        if (i > 4)
                            chartData.push({ value: otherFlow, name: "其他" });
                    }
                    var option = {
                        tooltip: {
                            trigger: 'item',
                            formatter: function (params, ticket, callback) {
                                var str = null;
                                if (params) {
                                    var d = params;
                                    str = d.name + "<br />" + numeral(d.value).format("0.0b") + "(" + params.percent + "%)";
                                }
                                else {
                                    str = "暂无内容"
                                }
                                return str;
                            }
                        },
                        calculable: true,
                        series: [
                            {
                                name: '访问来源',
                                type: 'pie',
                                radius: '35%',
                                center: ['50%', '60%'],
                                data: chartData
                            }
                        ]
                    };
                    echarts.init(elem.get(0)).setOption(option, true);
                };
                $scope.$watch("record.ratioList", function () {
                    render();
                });
            }
        };
    });
});