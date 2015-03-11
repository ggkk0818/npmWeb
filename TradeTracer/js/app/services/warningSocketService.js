define([
  'angular',
  'jquery',
  'lodash',
  'config'
],
function (angular, $, _, config) {
    'use strict';
    var module = angular.module('app.services');
    module.service('warningSocketService', function ($routeParams, $http, $rootScope, $timeout) {
        var socket = null,
            callback = {},
            thiz = this;
        var onmessage = function (e) {
            for (var key in callback) {
                if (typeof callback[key] === "function") {
                    callback[key].call(this, e);
                }
            }
        };
        var onerror = function (e) {
            console.error("warning service socket error.", e);
            delete socket.onmessage;
            delete socket.onerror;
            delete socket.onclose;
            delete socket.onopen;
            $timeout(function () {
                thiz.open();
            }, 3000);
        };
        var onclose = function (e) {
            console.warn("warning service socket closed.", e);
            $timeout(function () {
                console.warn("warning service socket reconnect...", e);
                thiz.open();
            }, 3000);
        };
        this.open = function () {
            socket = new WebSocket("ws://" + window.location.hostname + ":8080/npm/warnSocket");
            socket.onerror = onerror;
            socket.onopen = function () {
                socket.onmessage = onmessage;
                socket.onclose = onclose;
            };
        };
        this.isOpen = function () {
            return socket && socket.readyState == WebSocket.OPEN ? true : false;
        };
        //注册监听器
        this.on = function () {
            var func = null,
                alias = null;
            if (arguments.length > 0) {
                if (typeof arguments[0] === "function" && (arguments.length < 2 || typeof arguments[1] !== "function")) {
                    func = arguments[0];
                }
                else {
                    alias = new String(arguments[0]);
                }
            }
            if (arguments.length > 1) {
                if (typeof arguments[1] === "function") {
                    func = arguments[1];
                }
            }
            if (func) {
                callback[alias || new Date().getTime()] = func;
            }
        };
        this.off = function (arg) {
            if (typeof arg === "function") {
                for (var key in callback) {
                    if (callback[key] === arg) {
                        delete callback[key];
                        break;
                    }
                }
            }
            else if (typeof arg === "string") {
                delete callback[arg];
            }
            else {
                callback = {};
            }
        };
        this.destory = function () {
            callback = {};
            if (socket) {
                delete socket.onmessage;
                delete socket.onerror;
                delete socket.onclose;
                delete socket.onopen;
                socket.close();
                socket = null;
            }
        };
    });
});