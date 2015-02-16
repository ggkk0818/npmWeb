define([
    'angular',
    'jquery',
    'lodash',
    'require',
    'bootstrap',
    'bootstrap-datetimepicker',
    'bootstrap-datetimepicker-zhcn',
    'bootstrap-popover',
    'angular-sanitize',
    'angular-cookies',
    //'angular-dragdrop',
    'angular-loader',
    'angular-mocks',
    'angular-resource',
    'angular-route',
    'angular-touch',
    //'angular-strap',
    'angular-elastic',
    //'bindonce',
    'jquery-ui',
    'jquery-cookie',
    'jquery-mousewheel',
    'jquery-jscrollpane',
    'jquery-elasticsearch',
    'jquery-outerhtml',
    'highcharts',
    'highcharts-nodata',
    'date-format',
    'numeral',
    'numeral-cn',
    'json-format'
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
            .when('/app/view', {
                templateUrl: 'js/app/partials/appView.html',
                controller: 'AppViewCtrl'
            })
            .when('/app/snap', {
                templateUrl: 'js/app/partials/appSnap.html',
                controller: 'AppSnapCtrl'
            })
            .when('/statistic', {
                templateUrl: 'js/app/partials/statistic.html',
                controller: 'StatisticCtrl'
            })
            .when('/trace/statistic', {
                templateUrl: 'js/app/partials/statisticSearch.html',
                controller: 'StatisticSearchCtrl'
            })
            .when('/trace/log', {
                templateUrl: 'js/app/partials/logSearch.html',
                controller: 'LogSearchCtrl'
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
    _.each('controllers directives factories services'.split(' '), function (type) {
        var module_name = 'app.' + type;
        // create the module
        app.useModule(angular.module(module_name, []));
        // push it into the apps dependencies
        apps_deps.push(module_name);
    });

    // load the core components
    require(['controllers/all', 'directives/all'], function () {
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