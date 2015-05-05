define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/warningSearch.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('ProtocolChartCtrl', function ($rootScope, $scope, $route, $timeout, $location, warningService, logService) {
        //初始化变量
        $scope.protocolType = null;
        //初始化方法
        $scope.init = function () {
            if ($route.current.params.protocol) {
                $scope.protocolType = $route.current.params.protocol;
            }
            else {
                return;
            }
        };

        //执行初始化
        $scope.init();
    });
});