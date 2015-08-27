define([
  'angular',
  'app',
  'lodash'
],
function (angular, app, _) {
    'use strict';

    angular
      .module('app.directives')
      .directive('serverViewChart', function ($compile, $window, $timeout) {
          return {
              restrict: 'C',
              link: function ($scope, elem) {
                  var record = $scope.record, chartData = [];
                  if (record && record.flowRatioList) {
                      var otherFlow = 0;
                      for (var i = 0; i < record.flowRatioList.length; i++) {
                          var detail = record.flowRatioList[i],
                              total_bytes = detail.value || 0;
                          if (i < 4 || record.flowRatioList.length == 4)
                              chartData.push({ value: [detail.name, total_bytes] });
                          else
                              otherFlow += total_bytes;
                      }
                      if (i > 4)
                          chartData.push({ value: ["其他", otherFlow] });
                  }
                  var option = {
                      animation: true,
                      grid: {
                          x: 40,
                          y: 5,
                          x2: 20,
                          y2: 5
                      },
                      title: {
                          show: false
                      },
                      calculable: true,
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
                          show: false,
                          data: ['总流量'],
                          //data: ['总流量', '发送', '接收'],
                      },
                      toolbox: {
                          show: false
                      },
                      xAxis: [{
                          type: 'time',
                          axisLine: { show: false }
                      }],
                      yAxis: [{
                          type: 'value',
                          splitNumber: 2,
                          axisLabel: { margin: 3 },
                          axisLine: { show: false }
                      }],
                      series: [{
                          name: '总流量',
                          type: 'line',
                          symbol: 'none',
                          data: totalflowData
                      }]
                  };
                  $timeout(function () {
                      if (elem.find("div[data-chart=flow]").length) {
                          echarts.init(elem.find("div[data-chart=flow]").get(0), "blue").setOption(option_flow, true);
                      }
                  });
              }
          };
      });
});