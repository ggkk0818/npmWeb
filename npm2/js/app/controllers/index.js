define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/index.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('IndexCtrl', function ($rootScope, $scope, $route, $interval, $location, $timeout, $window) {
        //初始化
        $scope.init = function () {

        };
            
        //窗口调整时更新图表大小
        var windowResize = function () {
            var $bgImg = $("#bg_img");
            $bgImg.height($(window).height() - 50);
        };
        $($window).off("resize.index").on("resize.index", windowResize).trigger("resize.index");
        //离开该页事件
        $scope.$on("$routeChangeStart", function () {
            $($window).off("resize.index");
        });
        //执行初始化
        $scope.init();
    });
});