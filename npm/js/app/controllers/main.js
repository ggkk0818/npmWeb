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
                { name: "实时监控", href: "#/", icon: "glyphicon-eye-open" }
            ]
        });
        sidebarNav.push({
            name: "按协议查看",
            href: null,
            children: [
                { name: "HTTP", href: "#/protocol/http", icon: "glyphicon-screenshot" },
                { name: "8583", href: "#/protocol/8583", icon: "glyphicon-th" },
                { name: "20022", href: "#/protocol/20022", icon: "glyphicon-list-alt" },
                { name: "SOAP-XML", href: "#/protocol/soap", icon: "glyphicon-globe" },
                { name: "TUXEDO", href: "#/protocol/tuxedo", icon: "glyphicon-road" },
                { name: "MQ", href: "#/protocol/mq", icon: "glyphicon-tasks" },
                { name: "DB2", href: "#/protocol/db2", icon: "glyphicon-modal-window" },
                { name: "ORACLE", href: "#/protocol/oracle", icon: "glyphicon-credit-card" },
            ]
        });
        sidebarNav.push({
            name: "统计分析",
            href: null,
            children: [
                { name: "历史回放", href: "#/history", icon: "glyphicon-facetime-video" },
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
            name: "物理拓扑",
            href: "#/device/statistic"
        });
        var getRoutePath = function (target) {
            var path = null;
            if (target && target.$$route) {
                path = target.$$route.originalPath;
                if (target.pathParams) {
                    for (var name in target.pathParams) {
                        path = path.replace(":" + name, target.pathParams[name]);
                    }
                }
            }
            return path;
        };
        $rootScope.$on('$routeChangeSuccess', function (event, target) {
            var page = null;
            if (target.$$route) {
                _.forEach($scope.sidebarNav, function (val) {
                    if ("#" + getRoutePath(target) == val.href)
                        page = val;
                    else if (val.children) {
                        _.forEach(val.children, function (child) {
                            if ("#" + getRoutePath(target) == child.href)
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