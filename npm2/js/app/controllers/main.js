﻿define(['angular', 'lodash', 'jquery', 'services/all'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('MainCtrl', function ($rootScope, $scope, $route, $window, $location, browserCheckService, warningService) {
        //初始化变量
        $scope.showFooter = true;
        //导航信息
        var sidebarNav = [];
        sidebarNav.push({ name: "网络总览", href: "#/flow/summary", icon: "glyphicon-th-large" });
        sidebarNav.push({ name: "服务透视", href: "#/", icon: "glyphicon-th-large" });
        sidebarNav.push({ name: "应用透视", href: "#/app/perspective", icon: "glyphicon-lock" });
        sidebarNav.push({ name: "主动测评", href: "#/scan", icon: "glyphicon-th" });
        $scope.sidebarNav = sidebarNav;
        //其他导航页面信息
        var otherNav = [];
        otherNav.push({
            name: "网络总览",
            href: "#/flow/.*"
        });
        otherNav.push({
            name: "服务透视",
            href: "#/network/.*"
        });
        otherNav.push({
            name: "告警中心",
            href: "#/warn/center"
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
        //ajax登陆状态检测
        $(document).ajaxSend(function (event, xhr, settings) {
            if (!settings)
                return;
            if (!settings.headers)
                settings.headers = {};
            settings.headers["X-Requested-With"] = "XMLHttpRequest";
        }).ajaxComplete(function (event, xhr, settings) {
            if (xhr && xhr.status == 401) {
                $window.location.href = "login.html";
            }
        }).ajaxError(function (event, xhr, settings) {
            if (xhr && xhr.status == 401) {
                $window.location.href = "login.html";
            }
        });
        //检测浏览器类型，提示使用chrome
        browserCheckService.check();
    });
});