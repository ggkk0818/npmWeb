define(['angular', 'lodash', 'jquery', 'services/all', 'css!partials/settings.css'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('SettingsCtrl', function ($rootScope, $scope, $route, $timeout) {
        $scope.init = function () {
        };
        //执行初始化
        $scope.init();
    });
});