define([
  'angular',
  'app',
  'lodash'
],
function (angular, app, _) {
    'use strict';

    angular
      .module('app.directives')
      .directive('indexTopologyPopover', function ($compile, $window) {
          return {
              restrict: 'A',
              priority: 1,
              link: function ($scope, elem, attr) {
                  var watcherHandler = function () {
                      var deviceList = $scope[attr.deviceList],
                          r = 0;
                      if (deviceList && deviceList.length) {
                          for (var i = 0; i < deviceList.length; i++) {
                              var record = deviceList[i];
                              r += record.count || 0;
                              r += record.warnCount || 0;
                              r++;
                          }
                      }
                      return r;
                  };
                  var render = function () {
                      var deviceList = $scope[attr.deviceList];
                      if (deviceList && deviceList.length > 0) {
                          elem.attr("data-toggle", "popover");
                          //elem.attr("title", "统计信息");
                          var content = '<table class="table table-hover  table-striped">'
                              + '<thead>'
                              + '<tr>'
                              + '<th>源IP</th>'
                              + '<th><span class="glyphicon glyphicon-send ll" aria-hidden="true"></span></th>'
                              + '<th><span class="glyphicon glyphicon-barcode jybs" aria-hidden="true"></span></th>'
                              + '<th><span class="glyphicon glyphicon-alert gjts" aria-hidden="true"></span></th>'
                              + '<th>目标IP</th>'
                              + '</tr>'
                              + '</thead>'
                              + '<tbody>';
                          for (var i = 0; i < deviceList.length; i++) {
                              var record = deviceList[i];
                              if (!record.srcip)
                                  record.srcip = "";
                              if (!record.dstip)
                                  record.dstip = "";
                              if (!record.allflow)
                                  record.allflow = "";
                              if (!record.count)
                                  record.count = 0;
                              if (!record.warnCount)
                                  record.warnCount = 0;
                              var href = '#/trace/statistic?'
                                  + 'logType=' + encodeURIComponent(attr.type)
                                  + '&startTime=' + encodeURIComponent($scope.topology_startTime)
                                  + '&endTime=' + encodeURIComponent($scope.topology_endTime)
                                  + '&srcIp=' + encodeURIComponent(record.srcip)
                                  + '&dstIp=' + encodeURIComponent(record.dstip);
                              var warnHref = '#/warning?'
                                  + 'logType=' + encodeURIComponent(attr.warnType || '')
                                  + '&startTime=' + encodeURIComponent($scope.topology_startTime)
                                  + '&endTime=' + encodeURIComponent($scope.topology_endTime)
                                  + '&srcIp=' + encodeURIComponent(record.srcip)
                                  + '&dstIp=' + encodeURIComponent(record.dstip);
                              content += '<tr>'
                                  + '<td><a href="' + href + '">' + record.srcip + '</a></td>'
                                  + '<td><a href="' + href + '">' + record.allflow + '</a></td>'
                                  + '<td><a href="' + href + '">' + record.count + '</a></td>'
                                  + '<td><a href="' + warnHref + '">' + record.warnCount + '</a></td>'
                                  + '<td><a href="' + href + '">' + record.dstip + '</a></td>'
                                  + '</tr>'
                                  + "</a>";
                          }
                          content += "</tbody>";
                          content += "</table>";
                          elem.attr("data-content", content);
                          elem.popover();
                      }
                      else {
                          elem.removeAttr("data-toggle");
                          elem.removeAttr("title");
                          elem.removeAttr("data-content");
                          elem.popover("destroy");
                      }
                  };
                  $scope.$watch(watcherHandler, render);
              }
          };
      });
});