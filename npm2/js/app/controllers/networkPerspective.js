define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/networkPerspective.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('NetworkPerspectiveCtrl', function ($rootScope, $scope, $route, $interval, $location, $timeout, $window) {
        //初始化
        $scope.init = function () {
            $timeout(function () {
                $("#affix").affix({
                    offset: {
                        top: 200,
                        bottom: 50
                    }
                });
                $("body").scrollspy({ target: "#affix" })
            });
        };

        //离开该页事件
        $scope.$on("$routeChangeStart", function () {
        });
        //执行初始化
        $scope.init();
    });
});