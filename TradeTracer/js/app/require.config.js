﻿'use strict';
require.config({
    baseUrl: 'js/app',
    paths: {
        config: './app-config',
        css: '../vendor/require/css',
        text: '../vendor/require/text',
        moment: '../vendor/moment-with-langs',
        angular: '../vendor/angular/angular',
        'angular-cookies': '../vendor/angular/angular-cookies',
        //'angular-dragdrop': '../vendor/angular/angular-dragdrop',
        'angular-loader': '../vendor/angular/angular-loader',
        'angular-mocks': '../vendor/angular/angular-mocks',
        'angular-resource': '../vendor/angular/angular-resource',
        'angular-route': '../vendor/angular/angular-route',
        'angular-sanitize': '../vendor/angular/angular-sanitize',
        //'angular-strap': '../vendor/angular/angular-strap',
        'angular-touch': '../vendor/angular/angular-touch',
        'angular-elastic': '../vendor/elasticjs/elastic-angular-client',
        bindonce: '../vendor/angular/bindonce',
        lodash: '../vendor/lodash',
        jquery: '../vendor/jquery/jquery-1.11.2',
        'jquery-cookie': '../vendor/jquery/jquery.cookie',
        'jquery-mousewheel': '../vendor/jquery/jquery.mousewheel',
        'jquery-ui': '../vendor/jquery/jquery-ui',
        'jquery-jscrollpane': '../vendor/jquery/jquery.jscrollpane',
        'jquery-elasticsearch': '../vendor/elasticjs/elasticsearch.jquery',
        'jquery-outerhtml': '../vendor/jquery/jquery.outerhtml',
        'jquery-easing': '../vendor/jquery/jquery.easing.1.3',
        bootstrap: '../vendor/bootstrap/js/bootstrap',
        'bootstrap-datetimepicker': '../vendor/bootstrap-datetimepicker/bootstrap-datetimepicker',
        'bootstrap-datetimepicker-zhcn': '../vendor/bootstrap-datetimepicker/bootstrap-datetimepicker.zh-CN',
        'bootstrap-popover': '../vendor/bootstrap/js/popover',
        numeral: '../vendor/numeral/numeral',
        'numeral-cn': '../vendor/numeral/numeral.cn',
        elasticjs: '../vendor/elasticjs/elastic',
        highcharts: '../vendor/highcharts/highcharts.src',
        'highcharts-nodata': '../vendor/highcharts/modules/no-data-to-display',
        'date-format': '../vendor/Date.Format',
        'json-format': '../vendor/JSONFormat'
    },
    shim: {
        angular: {
            deps: ['jquery'],
            exports: 'angular'
        },
        bootstrap: {
            deps: ['jquery']
        },
        jquery: {
            exports: 'jQuery'
        },
        'jquery-cookie': ['jquery'],
        'jquery-mousewheel': ['jquery'],
        'jquery-ui': ['jquery'],
        'jquery-jscrollpane': ['jquery'],
        'jquery-elasticsearch': ['jquery'],
        'jquery-outerhtml': ['jquery'],
        'jquery-easing': ['jquery'],
        'angular-sanitize': ['angular'],
        'angular-cookies': ['angular'],
        //'angular-dragdrop': ['jquery', 'jquery-ui', 'angular'],
        'angular-loader': ['angular'],
        'angular-mocks': ['angular'],
        'angular-resource': ['angular'],
        'angular-route': ['angular'],
        'angular-touch': ['angular'],
        //'angular-strap': ['angular', 'bootstrap', 'timepicker', 'datepicker'],
        'angular-elastic': ['angular', 'elasticjs'],
        'bindonce': ['angular'],
        'bootstrap-popover': ['jquery', 'bootstrap'],
        highcharts: ['jquery'],
        'highcharts-nodata': ['highcharts'],
        'bootstrap-datetimepicker': ['bootstrap', 'jquery'],
        'bootstrap-datetimepicker-zhcn': ['bootstrap-datetimepicker'],
        'numeral-cn': ['numeral'],
    },
    waitSeconds: 60
});