define([
  'angular',
  'jquery',
  'lodash',
  'config'
],
function (angular, $, _, config) {
    'use strict';
    var module = angular.module('app.services');
    module.service('browserCheckService', function ($http, $rootScope, $interval) {
        var thiz = this;

        this.check = function () {
            var isChrome = window.navigator.userAgent.indexOf("Chrome") !== -1;
            if (!isChrome) {
                var html = '<div id="browserUpdateDiv" style="position:absolute;top:-50px;left:50%;margin-left:-290px;width:560px;height:50px;z-index:100;">'
                    + '<a href="http://www.google.cn/chrome/browser/" target="_blank"><img alt="" src="img/browserCheck.jpg" style="border:0;" /></a>'
                    + '</div>';
                document.body.innerHTML += html;
                $("#browserUpdateDiv").delay(1000).animate({ top: 0 }, "slow").delay(10000).animate({ top: -50 }, "slow", function () { $(this).remove(); });
            }
        };

    });
});