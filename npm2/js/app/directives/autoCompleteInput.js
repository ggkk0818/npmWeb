define([
  'angular',
  'app',
  'lodash'
],
function (angular, app, _) {
    'use strict';

    angular.module('app.directives').directive('autoCompleteInput', function ($compile, $window, networkOverviewService, dateTimeService) {
        return {
            restrict: 'C',
            link: function ($scope, elem) {
                $(elem).autocomplete({
                    groupBy: "type",
                    lookup: function (query, done) {
                        var ipSegmentArr = null, ipGroupArr = null;
                        var queryDone = function () {
                            var suggestions = [];
                            if (ipSegmentArr && ipSegmentArr.length) {
                                for (var i = 0; i < ipSegmentArr.length; i++) {
                                    var record = ipSegmentArr[i];
                                    suggestions.push({ value: record.ipSegment, data: { type: "网段" } });
                                }
                            }
                            if (ipGroupArr && ipGroupArr.length) {
                                for (var i = 0; i < ipGroupArr.length; i++) {
                                    var record = ipGroupArr[i];
                                    suggestions.push({ value: record.group, data: { type: "IP组" } });
                                }
                            }
                            done({ suggestions: suggestions });
                        };
                        var params = {
                            startTime: dateTimeService.serverTime.Format("yyyy-MM-dd") + " 00:00:00",
                            endTime: dateTimeService.serverTime.Format("yyyy-MM-dd") + " 23:59:59",
                            start: 0,
                            limit: 999
                        };
                        networkOverviewService.ipSegment(params, function (data) {
                            if (data && data.data) {
                                ipSegmentArr = data.data;
                            }
                            queryDone();
                        });
                        networkOverviewService.groupList(params, function (data) {
                            if (data && data.data) {
                                ipSegmentArr = data.data;
                            }
                            queryDone();
                        });
                    },
                    onSelect: function (suggestion) {
                        //alert('You selected: ' + suggestion.value + ', ' + suggestion.data);
                    }
                });
            }
        };
    });
});