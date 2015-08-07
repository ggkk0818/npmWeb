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
                  var record = $scope.record, chartData = [], markerData = [];
                  if (record && record.flowData) {
                      for (var i = 0; i < record.flowData.length; i++) {
                          var d = record.flowData[i],
                              datetime = new Date(d.datetime),
                              internet_bytes = (d.internet_send_bytes || 0) + (d.internet_rec_bytes || 0),
                              intranet_bytes = (d.intranet_send_bytes || 0) + (d.intranet_rec_bytes || 0);
                          chartData.push({ name: datetime, value: record.type == 0 ? intranet_bytes : internet_bytes })
                      }
                  }
                  if (record && record.critical_info) {
                      var criticalArr = record.critical_info.split(",");
                      for (var i = 0; i < criticalArr.length; i++) {
                          var date = new Date(criticalArr[i].replace(/-/g, "/"));
                          if(!isNaN(date))
                              markerData.push({ name: date, label: "&nbsp;" });
                      }
                  }
                  var options = {
                      data: chartData,
                      markers: markerData,
                      transition_on_update: false,
                      width: elem.width(),
                      height: 200,
                      target: elem.get(0),
                      x_accessor: 'name',
                      y_accessor: 'value'
                  };
                  $timeout(function () {
                      MG.data_graphic(options);
                  });
              }
          };
      });
});