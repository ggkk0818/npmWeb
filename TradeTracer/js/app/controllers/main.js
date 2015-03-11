define(['angular', 'lodash', 'jquery', 'services/all'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('MainCtrl', function ($rootScope, $scope, $route, $window, $location) {
        //导航信息
        var sidebarNav = [];
        sidebarNav.push({
            name: "总体",
            href: "#/"
        });
        sidebarNav.push({
            name: "应用层视图",
            href: "#/app/view"
        });
        sidebarNav.push({
            name: "应用层快照",
            href: "#/app/snap"
        });
        sidebarNav.push({
            name: "多维统计",
            href: "#/statistic"
        });
        sidebarNav.push({
            name: "交易追踪",
            href: "#/trace/statistic"
        });
        sidebarNav.push({
            name: "单笔追踪",
            href: "#/trace/log"
        });
        sidebarNav.push({
            name: "告警",
            href: "#/warning"
        });
        $scope.sidebarNav = sidebarNav;
        //其他导航页面信息
        var otherNav = [];
        otherNav.push({
            name: "搜索",
            href: "#/search/.*"
        });
        otherNav.push({
            name: "报表",
            href: "#/report/.*"
        });
        $rootScope.$on('$routeChangeSuccess', function (event, target) {
            var page = null;
            if (target.$$route) {
                _.forEach($scope.sidebarNav, function (val) {
                    if ("#" + target.$$route.originalPath == val.href)
                        page = val;
                });
                if (!page) {
                    _.forEach(otherNav, function (val) {
                        if (new RegExp(val.href).test("#" + target.$$route.originalPath))
                            page = val;
                    });
                }
            }
            if (!page)
                page = otherNav[0];
            $scope.currentPage = page;
            //页面跳转时移除弹出框背景
            if ($("body > .modal-backdrop").length) {
                $("body > .modal-backdrop").remove();
                $("body").removeClass("modal-open");
            }
        });
        //登出
        $scope.logout = function () {
            $.removeCookie("LOGIN_STATE");
            $window.location.href = "login.html";
        };
    });
});