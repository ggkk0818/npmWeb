define([
  'angular',
  'app',
  'lodash'
],
function (angular, app, _) {
    'use strict';

    angular
      .module('app.directives')
      .directive('networkPerspectiveServiceRecord', function ($compile, $window, $timeout) {
          return {
              restrict: 'C',
              link: function ($scope, elem) {
                  var render = function () {
                      if (!$scope.service || !$scope.service.metric)
                          return;
                      var singleLineChartProp = ["flowRatio", "timeConnDuration", "connRatio", "connRequestRatio"],
                          multiLineChartProp = [
                              { name: "transTime", props: ["outTransTime", "inTransTime"], tooltip: "ms", sum: true },//数据传输时间
                              { name: "netPayloadTransTime", props: ["outNetPayloadTransTime", "inNetPayloadTransTime"], tooltip: "ms", sum: true },//净荷传输时间
                              { name: "netPayloadTime", props: ["outNetPayloadTime", "inNetPayloadTime"], tooltip: "byte", sum: true },//净荷
                              { name: "packetLossRatio", props: ["outPacketLossRatio", "inPacketLossRatio"], tooltip: "%", sum: false },//丢包率
                              { name: "packetRetransRatio", props: ["outPacketRetransRatio", "inPacketRetransRatio"], tooltip: "%", sum: true },//包重传率
                              { name: "retransRatio", props: ["outRetransRatio", "inRetransRatio"], tooltip: "kbps", sum: true },//重传率
                              { name: "timeRetrans", props: ["outTimeRetrans", "inTimeRetrans"], tooltip: "ms", sum: true }//重传延时
                          ],
                          simgleColumnChartProp = ["packet", "connection"];
                      if ($scope.service.metric.time) {
                          for (var i = 0; i < $scope.service.metric.time.length; i++) {
                              if (typeof $scope.service.metric.time[i] === "number")
                                  $scope.service.metric.time[i] = new Date($scope.service.metric.time[i]);
                          }
                      }
                      for (var index in singleLineChartProp) {
                          var prop = singleLineChartProp[index];
                          if ($scope.service.metric[prop]) {
                              var chartData = [];
                              for (var i = 0; i < $scope.service.metric[prop].length; i++) {
                                  if (!$scope.service.metric.time || i >= $scope.service.metric.time.length)
                                      break;
                                  chartData.push({ time: $scope.service.metric.time[i], value: $scope.service.metric[prop][i] });
                              }
                              MG.data_graphic({
                                  data: chartData,
                                  full_width: true,
                                  height: 120,
                                  right: 20,
                                  top: 17,
                                  mouseover: function (d, i) {
                                      //custom format the rollover text, show days
                                      var str = (d.time instanceof Date ? d.time.Format("hh:mm:ss") + " " : "") + (d.value || 0) + "个";
                                      elem.find("[data-type=" + prop + "] svg .mg-active-datapoint").html(str);
                                  },
                                  target: elem.find("[data-type=" + prop + "]").get(0),
                                  x_accessor: 'time',
                                  y_accessor: 'value'
                              });
                          }
                      }
                      for (var index in multiLineChartProp) {
                          var prop = multiLineChartProp[index],
                              chartDataArr = [];
                          if (prop.props) {
                              for (var j = 0; j < prop.props.length; j++) {
                                  var chartData = [];
                                  if ($scope.service.metric[prop.props[j]]) {
                                      for (var i = 0; i < $scope.service.metric[prop.props[j]].length; i++) {
                                          if (!$scope.service.metric.time || i >= $scope.service.metric.time.length)
                                              break;
                                          chartData.push({ time: $scope.service.metric.time[i], value: $scope.service.metric[prop.props[j]][i] });
                                      }
                                  }
                                  chartDataArr.push(chartData);
                              }
                          }
                          MG.data_graphic({
                              legend:['流出','流入'],
                              data: chartDataArr,
                              full_width: true,
                              height: 120,
                              right: 20,
                              top: 17,
                              mouseover: function (d, i) {
                                  //custom format the rollover text, show days
                                  var str = (d.time instanceof Date ? d.time.Format("hh:mm:ss") + " " : "") + (d.value || 0) + prop.tooltip;
                                  elem.find("[data-type=" + prop + "] svg .mg-active-datapoint").html(str);
                              },
                              target: elem.find("[data-type=" + prop.name + "]").get(0),
                              x_accessor: 'time',
                              y_accessor: 'value'
                          });
                      }
                      for (var index in simgleColumnChartProp) {
                          var prop = simgleColumnChartProp[index];
                          if ($scope.service.metric[prop]) {
                              var categoryData = [];
                              for (var i = 0; i < $scope.service.metric.time.length; i++) {
                                  categoryData.push($scope.service.metric.time[i].Format("hh:mm"));
                              }
                              echarts.init(elem.find("[data-type=" + prop + "]").get(0)).setOption({
                                  title: { show: false },
                                  tooltip: {
                                      trigger: 'axis',
                                      showDelay: 0,
                                      transitionDuration: 0,
                                      position: [120, 0],
                                      padding: [0, 0, 0, 0],
                                      backgroundColor: "rgba(255,255,255,1)",
                                      textStyle: { color: "#333", align: "right" },
                                      formatter: function (params) {
                                          var str = null;
                                          if (params && params.length) {
                                              str = params[0].name + " ";
                                              for (var i = 0; i < params.length; i++) {
                                                  var data = params[i];
                                                  str += data.seriesName + ":" + data.value + "kbps ";
                                              }
                                          }
                                          else {
                                              str = "暂无信息";
                                          }
                                          return str;
                                      }
                                  },
                                  legend: { show: false, data: [prop] },
                                  toolbox: { show: false },
                                  dataZoom: { show: false },
                                  grid: {
                                      x: 40,
                                      x2: 10,
                                      y: 20,
                                      y2: 40
                                  },
                                  xAxis: [{
                                      type: 'category',
                                      data: categoryData
                                  }],
                                  yAxis: [{
                                      type: 'value'
                                  }],
                                  series: [{
                                      name: prop,
                                      type: "bar",
                                      data: $scope.service.metric[prop]
                                  }]
                              }, true);
                              
                          }
                      }
                  };
                  $scope.$watch(function () {
                      var str = "";
                      if ($scope.service.metric && $scope.service.metric.time) {
                          for (var i = 0; i < $scope.service.metric.time.length; i++) {
                              str += new String($scope.service.metric.time[i]);
                          }
                      }
                      return str;
                  }, function () {
                      render();
                  });
              }
          };
      });
});