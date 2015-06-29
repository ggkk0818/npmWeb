define([
  'angular',
  'app',
  'lodash'
],
function (angular, app, _) {
    'use strict';

    angular
      .module('app.directives')
      .directive('flowHistoryDetailRecord', function ($compile, $window, $timeout) {
          return {
              restrict: 'C',
              link: function ($scope, elem) {
                  var record = $scope.record,
                      totalflowData = [],
                      totalPackageData = [],
                      sessionData = [];
                  if (record && record.ipDetailResults) {
                      for (var i = 0; i < record.ipDetailResults.length; i++) {
                          var detail = record.ipDetailResults[i],
                              totalFlow = detail.totalFlow || 0,
                              totalPacket = detail.totalPacket || 0,
                              totalSession = detail.totalSession || 0;
                          totalflowData.push({ value: [detail.time, (totalFlow * 8 / 1024).toFixed(1)], record: { time: detail.time, ip: record.ip, port: record.port, protocol: record.protocol } });
                          totalPackageData.push({ value: [detail.time, totalPacket], record: { time: detail.time, ip: record.ip, port: record.port, protocol: record.protocol } });
                          sessionData.push({ value: [detail.time, totalSession], record: { time: detail.time, ip: record.ip, port: record.port, protocol: record.protocol } });
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
                          data: ['总流量']
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
                          data: ['总数据包']
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
                      }]
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
                          echarts.init(elem.find("div[data-chart=session]").get(0), "blue").setOption(option_session, true).on(echarts.config.EVENT.CLICK, function (e) {});
                          elem.find("div[data-chart=session]").off("click").on("click", function () {
                              var record = null;
                              if (option_session.series.length > 0 && option_session.series[0].data.length > 0) {
                                  record = option_session.series[0].data[0].record;
                              }
                              if (record && $scope.$parent && typeof ($scope.$parent.showSessionModal) === "function") {
                                  app.safeApply($scope, function () {
                                      $scope.$parent.showSessionModal(record);
                                  });
                              }
                          });
                      }
                  });
              }
          };
      });
});