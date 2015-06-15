define([
  'angular',
  'app',
  'lodash'
],
function (angular, app, _) {
    'use strict';

    angular
      .module('app.directives')
      .directive('flowHistoryRecord', function ($compile, $window, $timeout) {
          return {
              restrict: 'C',
              link: function ($scope, elem) {
                  var record = $scope.record,
                      upflowData = [], downflowData = [], totalflowData = [],
                      sendPackageData = [], recvPackageData = [], totalPackageData = [],
                      sessionData = [];
                  if (record && record.details) {
                      for (var i = 0; i < record.details.length; i++) {
                          var detail = record.details[i],
                              rec_bytes = detail.rec_bytes || 0,
                              send_bytes = detail.send_bytes || 0,
                              rec_package = detail.rec_package || 0,
                              send_package = detail.send_package || 0;
                          upflowData.push({ value: [detail.datetime, (send_bytes * 8 / 1024).toFixed(1)] });
                          downflowData.push({ value: [detail.datetime, (rec_bytes * 8 / 1024).toFixed(1)] });
                          totalflowData.push({ value: [detail.datetime, ((send_bytes + rec_bytes) * 8 / 1024).toFixed(1)] });
                          sendPackageData.push({ value: [detail.datetime, send_package] });
                          recvPackageData.push({ value: [detail.datetime, rec_package] });
                          totalPackageData.push({ value: [detail.datetime, send_package + rec_package] });
                          sessionData.push({ value: [detail.datetime, detail.session || 0] });
                      }
                  }
                  var option_flow = {
                      animation: true,
                      grid: {
                          x: 40,
                          y: 5,
                          x2: 20,
                          y2: 5
                      },
                      title: {
                          show:false
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
                      }/*, {
                          name: '发送',
                          type: 'line',
                          symbol: 'none',
                          data: upflowData
                      }, {
                          name: '接收',
                          type: 'line',
                          symbol: 'none',
                          data: downflowData
                      }*/]
                  };
                  var option_package = {
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
                          data: ['总数据包'],
                          //data: ['总数据包', '发送', '接收'],
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
                          name: '总数据包',
                          type: 'line',
                          symbol: 'none',
                          data: totalPackageData
                      }/*, {
                          name: '发送',
                          type: 'line',
                          symbol: 'none',
                          data: sendPackageData
                      }, {
                          name: '接收',
                          type: 'line',
                          symbol: 'none',
                          data: recvPackageData
                      }*/]
                  };
                  var option_session = {
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
                          data: ['会话数']
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
                          name: '会话数',
                          type: 'line',
                          symbol: 'none',
                          data: sessionData
                      }]
                  };
                  $timeout(function () {
                      if (elem.find("div[data-chart=flow]").length) {
                          echarts.init(elem.find("div[data-chart=flow]").get(0), "blue").setOption(option_flow, true);
                      }
                      if (elem.find("div[data-chart=package]").length) {
                          echarts.init(elem.find("div[data-chart=package]").get(0), "blue").setOption(option_package, true);
                      }
                      if (elem.find("div[data-chart=session]").length) {
                          echarts.init(elem.find("div[data-chart=session]").get(0), "blue").setOption(option_session, true);
                      }
                  });
              }
          };
      });
});