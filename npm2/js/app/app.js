define([
    'angular',
    'jquery',
    'lodash',
    'require',
    'bootstrap',
    'bootstrap-datetimepicker',
    'bootstrap-datetimepicker-zhcn',
    'angular-sanitize',
    'angular-cookies',
    'angular-loader',
    'angular-mocks',
    'angular-resource',
    'angular-route',
    'angular-touch',
    'angular-elastic',
    'jquery-ui',
    'jquery-cookie',
    'jquery-mousewheel',
    'jquery-jscrollpane',
    'jquery-elasticsearch',
    'jquery-outerhtml',
    'jquery-easing',
    'jquery-numberanimate',
    'jquery-dateRangeSlider',
    'jquery-dateRangeSlider-withRuler',
    'jquery-scrollTo',
    'jquery-easypiechart',
    'jquery-viewport',
    'date-format',
    'numeral',
    'numeral-cn',
    'json-format',
    'echarts',
    'd3',
    'MG',
    //'MG-brushing',
    'liquidFillGauge'
], function (angular, $, _, appLevelRequire) {
    "use strict";
    var app = angular.module('app', []),
        pre_boot_modules = [],
        register_fns = {};

    /**
   * Tells the application to watch the module, once bootstraping has completed
   * the modules controller, service, etc. functions will be overwritten to register directly
   * with this application.
   * @param  {[type]} module [description]
   * @return {[type]}        [description]
   */
    app.useModule = function (module) {
        if (pre_boot_modules) {
            pre_boot_modules.push(module);
        } else {
            _.extend(module, register_fns);
        }
        return module;
    };
    app.safeApply = function ($scope, fn) {
        switch ($scope.$$phase) {
            case '$apply':
                // $digest hasn't started, we should be good
                $scope.$eval(fn);
                break;
            case '$digest':
                // waiting to $apply the changes
                setTimeout(function () { app.safeApply($scope, fn); }, 10);
                break;
            default:
                // clear to begin an $apply $$phase
                $scope.$apply(fn);
                break;
        }
    };
    app.config(function ($routeProvider, $controllerProvider, $compileProvider, $filterProvider, $provide) {
        $routeProvider
            .when('/', {
                templateUrl: 'js/app/partials/index.html',
                controller: 'IndexCtrl'
            })
            .when('/settings/group', {
                templateUrl: 'js/app/partials/settings.html',
                controller: 'SettingsCtrl'
            })
            .when('/settings/warn', {
                templateUrl: 'js/app/partials/settingsWarn.html',
                controller: 'SettingsWarnCtrl'
            })
            .when('/settings/app', {
                templateUrl: 'js/app/partials/settingsApp.html',
                controller: 'SettingsAppCtrl'
            })
            .when('/flow/summary', {
                templateUrl: 'js/app/partials/flowSummary.html',
                controller: 'FlowSummaryCtrl'
            })
            .when('/flow/detail', {
                templateUrl: 'js/app/partials/flowDetail.html',
                controller: 'FlowDetailCtrl'
            })
            .when('/flow/server', {
                templateUrl: 'js/app/partials/serverView.html',
                controller: 'ServerViewCtrl'
            })
            .when('/flow/pcap', {
                templateUrl: 'js/app/partials/flowPcap.html',
                controller: 'FlowPcapCtrl'
            })
            .when('/warn/center', {
                templateUrl: 'js/app/partials/warnCenter.html',
                controller: 'WarnCenterCtrl'
            })
            .when('/network/perspective', {
                templateUrl: 'js/app/partials/networkPerspective.html',
                controller: 'NetworkPerspectiveCtrl'
            })
            .when('/app/perspective', {
                templateUrl: 'js/app/partials/appPerspective.html',
                controller: 'AppPerspectiveCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
        // this is how the internet told me to dynamically add modules :/
        register_fns.controller = $controllerProvider.register;
        register_fns.directive = $compileProvider.directive;
        register_fns.factory = $provide.factory;
        register_fns.service = $provide.service;
        register_fns.filter = $filterProvider.register;
    });

    var apps_deps = ['elasticjs.service', 'ngSanitize', 'ngCookies', 'ngRoute', 'app'];
    _.each('controllers directives factories services filters'.split(' '), function (type) {
        var module_name = 'app.' + type;
        // create the module
        app.useModule(angular.module(module_name, []));
        // push it into the apps dependencies
        apps_deps.push(module_name);
    });

    // load the core components
    require(['controllers/all', 'directives/all', 'filters/all'], function () {
        // bootstrap the app
        angular.element(document).ready(function () {
            $('html').attr('ng-controller', 'MainCtrl');
            angular.bootstrap(document, apps_deps).invoke(['$rootScope', function ($rootScope) {
                  _.each(pre_boot_modules, function (module) {
                      _.extend(module, register_fns);
                  });
                  pre_boot_modules = false;

                  $rootScope.requireContext = appLevelRequire;
                  $rootScope.require = function (deps, fn) {
                      var $scope = this;
                      $scope.requireContext(deps, function () {
                          var deps = _.toArray(arguments);
                          // Check that this is a valid scope.
                          if ($scope.$id) {
                              $scope.$apply(function () {
                                  fn.apply($scope, deps);
                              });
                          }
                      });
                  };
              }]);
        });
    });

    return app;
});