define(['angular', 'lodash', 'jquery', 'services/all'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('MainCtrl', function ($rootScope, $scope, $route, $window, $location) {
        //导航信息
        var sidebarNav = [];
        sidebarNav.push({
            name: "全景视图",
            href: null,
            children: [
                { name: "实时监控", href: "#/", icon: "glyphicon-eye-open" },
                { name: "总体拓扑", href: "#/", icon: "glyphicon-equalizer" },
            ]
        });
        sidebarNav.push({
            name: "按协议查看",
            href: null,
            children: [
                { name: "HTTP", href: "#/", icon: "glyphicon-screenshot" },
                { name: "8583", href: "#/", icon: "glyphicon-th" },
                { name: "20022", href: "#/", icon: "glyphicon-list-alt" },
                { name: "SOAP-XML", href: "#/", icon: "glyphicon-globe" },
                { name: "TUXEDO", href: "#/", icon: "glyphicon-road" },
                { name: "MQ", href: "#/", icon: "glyphicon-tasks" },
                { name: "DB2", href: "#/", icon: "glyphicon-modal-window" },
                { name: "ORACLE", href: "#/", icon: "glyphicon-credit-card" },
            ]
        });
        sidebarNav.push({
            name: "统计分析",
            href: null,
            children: [
                { name: "历史回放", href: "#/", icon: "glyphicon-facetime-video" },
            ]
        });
        $scope.sidebarNav = sidebarNav;
        //其他导航页面信息
        var otherNav = [];
        otherNav.push({
            name: "设置",
            href: "#/settings"
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
                    else if (val.children) {
                        _.forEach(val.children, function (child) {
                            if ("#" + target.$$route.originalPath == child.href)
                                page = child;
                        });
                    }
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