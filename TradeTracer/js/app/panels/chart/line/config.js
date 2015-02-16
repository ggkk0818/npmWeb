define(['angular', 'lodash', 'jquery', 'services/all'], function (angular, _, $) {
    "use strict";
    var module = angular.module('app.controllers');
    module.controller('LineChartConfigController', function ($rootScope, $scope, $window, $timeout) {
        //默认配置信息
        $scope.config = {
            //general: {
            //    nullValueMode: "skipped",
            //    splitSeries: false,
            //    drilldown: false
            //},
            xAxis: {
                title: {
                    mode: "none",
                    defaultValue: null,
                    text: null
                }
            },
            yAxis: {
                title: {
                    mode: "none",
                    defaultValue: null,
                    text: null
                },
                scale: "linear",
                tickInterval: null,
                min: null,
                max: null
            },
            legend: {
                enabled: true,
                align: "right",
                verticalAlign: "middle",
                layout: 'vertical',
                //overflowMode: "left"
            }
        };
        //设置图表配置
        $scope.setConfig = function (config) {
            if (config) {
                _.assign(config, $scope.config);
                if (config.xAxis && config.xAxis.title && config.xAxis.title.text)
                    $scope.config.xAxis.title.defaultValue = config.xAxis.title.text;
                if (config.yAxis && config.yAxis.title && config.yAxis.title.text)
                    $scope.config.yAxis.title.defaultValue = config.yAxis.title.text;
            }
        };
        //获取图表配置
        $scope.getConfig = function () {
            return $scope.config;
        };
        //保存配置
        $scope.saveConfig = function () {
            $scope.$emit("chartConfigChange", $scope.config, $scope);
        };
        //文本框数值转换
        $scope.convertInt = function (str) {
            if (_.isEmpty(str)) {
                return null;
            }
            else {
                var reg = new RegExp("\\d+");
                if (reg.exec(str).length) {
                    return parseInt(reg.exec(str)[0]);
                }
                else {
                    return null;
                }
            }
        };
        //手动触发解决tab无法切换的问题
        $($window).on("click", "#line_chart_config_tabs_" + $scope.$id + " li a", function () {
            $(this).tab("show");
        });
        
    });
});