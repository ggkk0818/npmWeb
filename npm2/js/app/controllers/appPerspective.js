define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/index.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('AppPerspectiveCtrl', function ($rootScope, $scope, $route, $interval, $location, $timeout, $window) {
        //初始化变量
        var $appFrame = null;
        //初始化
        $scope.init = function () {
            $scope.$parent.showFooter = false;
            $timeout(function () {
                $appFrame = $("#appFrame");
                $appFrame.attr("src", "http://" + window.location.hostname + ":5601/#/dashboard/%E9%A6%96%E9%A1%B5");
                windowResize();
            });
        };

        //窗口调整时更新图表大小
        var windowResize = function () {
            if ($appFrame)
                $appFrame.height($(window).height() - 50);
        };
        $($window).off("resize.index").on("resize.appPerspective", windowResize);
        //离开该页事件
        $scope.$on("$routeChangeStart", function () {
            $scope.$parent.showFooter = true;
            $($window).off("resize.appPerspective");
        });
        //执行初始化
        $scope.init();
    });
});