define([
  'angular',
  'app',
  'lodash'
],
function (angular, app, _) {
    'use strict';

    angular
      .module('app.directives')
      .directive('pagination', function ($compile) {
          return {
              restrict: 'C',
              link: function ($scope, elem, attr) {
                  var ul = elem;
                  var clickFunc = attr.pageClick ? attr.pageClick : "show";
                  var pageNumAttr = attr.pageNum ? attr.pageNum : "pageNum";
                  var pageTotalAttr = attr.pageTotal ? attr.pageTotal : "pageTotal";
                  var render = function () {
                      var pageNum = $scope[pageNumAttr],
                          pageTotal = $scope[pageTotalAttr];
                      ul.children().remove();
                      //上一页
                      ul.append($compile(angular.element('<li class="previous' + (pageNum <= 1 ? ' disabled' : '') + '"><a class="page-controls" href="javascript:void(0);" ng-click="' + clickFunc + '(' + (pageNum > 1 ? pageNum - 1 : 1) + ')"><i class="glyphicon glyphicon-chevron-left"></i></a></li>'))($scope));
                      //第一页
                      if (pageNum > 3)
                          ul.append($compile(angular.element('<li' + (pageNum == 1 ? ' class="active"' : '') + '><a href="javascript:void(0);" ng-click="' + clickFunc + '(1)">1</a></li>'))($scope));
                      //...
                      if (pageNum > 4)
                          ul.append($compile(angular.element('<li class="disabled"><a href="javascript:void(0);">...</a></li>'))($scope));
                      //当前页附近5页
                      for (var i = Math.max(1, pageNum - 2) ; i <= Math.min(pageTotal, Math.max(1, pageNum - 2) + 4) ; i++) {
                          ul.append($compile(angular.element('<li' + (pageNum == i ? ' class="active"' : '') + '><a href="javascript:void(0);" ng-click="' + clickFunc + '(' + i + ')">' + i + '</a></li>'))($scope));
                      }
                      //...
                      if (pageTotal > 6 && pageTotal - pageNum > 3)
                          ul.append($compile(angular.element('<li class="disabled"><a href="javascript:void(0);">...</a></li>'))($scope));
                      //最后一页
                      if (pageTotal > 5 && pageTotal - pageNum > 2)
                          ul.append($compile(angular.element('<li' + (pageNum == pageTotal ? ' class="active"' : '') + '><a href="javascript:void(0);" ng-click="' + clickFunc + '(' + pageTotal + ')">' + pageTotal + '</a></li>'))($scope));
                      //下一页
                      ul.append($compile(angular.element('<li class="next' + (pageNum >= pageTotal ? ' disabled' : '') + '"><a class="page-controls" href="javascript:void(0);" ng-click="' + clickFunc + '(' + (pageNum < pageTotal ? pageNum + 1 : pageTotal) + ')"><i class="glyphicon glyphicon-chevron-right"></i></a></li>'))($scope));
                  };

                  $scope.$watch(pageNumAttr, render);
                  $scope.$watch(pageTotalAttr, render);
              }
          };
      });
});