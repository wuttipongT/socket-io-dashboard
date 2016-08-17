'use strict';
var service = angular.module('WebReference', [])

    .factory('Bussiness_Layer', ['$http', function ($http) {
        var origin = window.location.origin;
        var baseUrl = origin+'/';
        return {
            inbound: function () {
                return $http.get(baseUrl + 'inboundJson', { headers: { 'Cache-Control':'no-cache'}});
            },
            gate: function () {
                return $http.get(baseUrl + 'gate', { headers: { 'Cache-Control': 'no-cache' } });
            },
            outbound: function () {
                return $http.get(baseUrl + 'outboundJson', { headers: { 'Cache-Control': 'no-cache' } });
            },
            gateout: function () {
                return $http.get(baseUrl + 'gateout', { headers: { 'Cache-Control': 'no-cache' } });
            }
            
        }
    }])

    .factory('socket', ['$rootScope', function ($rootScope) {
        //var io = require('socket.io-client');
        var origin = window.location.origin;
        var socket = io.connect(origin + '/inbound', {
            'reconnection': true,
            'reconnectionDelay': 1000,
            'reconnectionDelayMax': 5000,
            'reconnectionAttempts': 5
        });
        return {
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            }
        };
    }])
    .factory('outbound', ['$rootScope', function ($rootScope) {
        //var io = require('socket.io-client');
        var origin = window.location.origin;
        var socket = io.connect(origin + '/outbound', {
            'reconnection': true,
            'reconnectionDelay': 1000,
            'reconnectionDelayMax': 5000,
            'reconnectionAttempts': 5
        });
        return {
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            }
        };
    }])
    .factory('PagerService', function () {
        var service = {};
        service.GetPager = GetPager;
        return service;

        //service implementtation

        function GetPager(totalItems, currentPage, pageSize) {
            //default to first page
            currentPage = currentPage || 1;
            //default page size is ...
            pageSize = pageSize || 10;
            //calculate total pages 
            var totalPages = Math.ceil(totalItems / pageSize);

            var startPage, endPage;
            if (totalPages <= 10) {
                //less then 10 total pages so show all
                startPage = 1;
                endPage = totalPages;
            } else {
                //more than 10 total pages so calculate start and end pages
                if (currentPage <= 6) {
                    startPage = 1;
                    endPage = 10;
                } else if (currentPage + 4 >= totalPages) {
                    startPage = totalPages - 9;
                    endPage = totalPages;
                } else {
                    startPage = currentPage - 5;
                    endPage = currentPage + 4;
                }   
            }
            // calculate start and end item indexes
            var startIndex = (currentPage - 1) * pageSize;
            var endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

            // create an array of pages to ng-repeat in the pager control
            var pages = range(startPage, endPage)//_.range(startPage, endPage + 1);
            function range(start, end, step, offset) { return Array.apply(null, Array((Math.abs(end - start) + ((offset||0)*2))/(step||1)+1)) .map(function(_, i) { return start < end ? i*(step||1) + start - (offset||0) :  (start - (i*(step||1))) + (offset||0) }) }

             // return object with all pager properties required by the view
            return {
                totalItems: totalItems,
                currentPage: currentPage,
                pageSize: pageSize,
                totalPages: totalPages,
                startPage: startPage,
                endPage: endPage,
                startIndex: startIndex,
                endIndex: endIndex,
                pages: pages
            };
        }
    });

//// Angular service module for connecting to JSON APIs
//angular.module('pullServices', ['ngResource']).
//    factory('pull', function ($resource) {
//        return $resource('polls/:pollId', {}, {
//            // Use this method for getting a list of polls
//            query: { method: 'GET', params: { pollId: 'polls' }, isArray: true }
//        })
//    }).
//    factory('socket', function ($rootScope) {
//        var socket = io.connect();
//        return {
//            on: function (eventName, callback) {
//                socket.on(eventName, function () {
//                    var args = arguments;
//                    $rootScope.$apply(function () {
//                        callback.apply(socket, args);
//                    });
//                });
//            },
//            emit: function (eventName, data, callback) {
//                socket.emit(eventName, data, function () {
//                    var args = arguments;
//                    $rootScope.$apply(function () {
//                        if (callback) {
//                            callback.apply(socket, args);
//                        }
//                    });
//                })
//            }
//        };
//    });