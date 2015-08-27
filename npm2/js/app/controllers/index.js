define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/index.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('IndexCtrl', function ($rootScope, $scope, $route, $interval, $location, $timeout, $window) {
        //初始化变量
        $scope.keywordInput = null;
        //初始化
        $scope.init = function () {
            $scope.$parent.showFooter = false;
        };

        //搜索
        $scope.search = function () {
            if ($scope.keywordInput && $scope.keywordInput.length) {
                $location.path("/network/perspective").search({ keyword: $scope.keywordInput });
            }
        };
        //表单输入框按键事件
        $scope.formKeypressHandler = function (e) {
            if (e.keyCode == 13) {
                $scope.search();
            }
        };

        //窗口调整时更新图表大小
        var windowResize = function () {
            var $bgImg = $("#bg_img");
            $bgImg.height($(window).height() - 50);
        };
        $($window).off("resize.index").on("resize.index", windowResize).trigger("resize.index");
        //离开该页事件
        $scope.$on("$routeChangeStart", function () {
            $scope.$parent.showFooter = false;
            $($window).off("resize.index");
        });
        //执行初始化
        $scope.init();
    });
});