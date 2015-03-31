define([
  'angular',
  'app',
  'lodash'
],
function (angular, app, _) {
    'use strict';

    angular
      .module('app.directives')
      .directive('indexWarntimelinePopover', function ($compile, $window) {
          return {
              restrict: 'A',
              priority: 1,
              link: function ($scope, elem, attr) {
                  var getWarnCount = function () {
                      var c = 0;
                      if ($scope.warn && $scope.warn.warnList && $scope.warn.warnList.length) {
                          for (var i = 0; i < $scope.warn.warnList.length; i++) {
                              if ($scope.warn.warnList[i].count)
                                  c += $scope.warn.warnList[i].count;
                          }
                      }
                      return c;
                  };
                  var render = function () {
                      if (getWarnCount() > 0) {
                          elem.attr("data-toggle", "popover");
                          elem.attr("title", "告警信息");
                          var content = "";
                          for (var i = 0; i < $scope.warn.warnList.length; i++) {
                              if (i > 0)
                                  content += "<br />";
                              var warn = $scope.warn.warnList[i];
                              content += warn.type + "告警" + warn.count + "条";
                          }
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
                  $scope.$watch(getWarnCount, render);
              }
          };
      });
});