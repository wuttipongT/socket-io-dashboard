//'use strict';
var app = angular.module('app', ['ngRoute','WebReference']);

app.config(['$routeProvider', function ($routeProvider) {
    
    $routeProvider

        //.when('/', {
        //    templateUrl: 'templates/outbound.html',
        //    controller: 'outboundCtrl'
        //})
        
        .when('/inbound', {
            templateUrl: 'templates/inbound.html',//templateUrl'templates/inbound.html',
            controller: 'dashCtrl',
        })

        .when("/outbound", {
            templateUrl: 'templates/outbound.html',//'templates/outbound.html',
            controller: 'outboundCtrl',
        })
        // If invalid route, just redirect to the main list view
        .otherwise({ redirectTo: '/inbound' });

}]);
//app.run(function ($rootScope) {
//    $rootScope.AssignedDate = Date;
//})
app.controller('dashCtrl', function ($scope, Bussiness_Layer, socket, $filter, $interval, PagerService) {
    // create a message to display in our view
    $scope.inbounds_tb1 = [];
    $scope.inbounds_tb2 = [];
    var temp_tb1 = [];
    $scope.vm = this;
    $scope.vm.pager = {};
    var total_Page = 12, j = 2;
    var stop = [];
    var timeDiff = function (date1, date2) {
        var a = new Date(date1).getTime(),
            b = new Date(date2).getTime(),
            diff = {};

        diff.milliseconds = a > b ? a % b : b % a;
        diff.seconds = diff.milliseconds / 1000;
        diff.minutes = diff.seconds / 60;
        diff.hours = diff.minutes / 60;
        diff.days = diff.hours / 24;
        diff.weeks = diff.days / 7;

        return diff;
    }
    $scope.fncTime = function (KPI_Load, Time_Load, index) {
        var arr = Time_Load.split(' ');
        var date = arr[0].split('-');
        var time = arr[1].split(':');;
        var timeStart = new Date();
        timeStart.setFullYear(date[0]);
        timeStart.setMonth(Number(date[1])-1);
        timeStart.setDate(date[2]);
        timeStart.setHours(time[0]);
        timeStart.setMinutes(time[1]);
        timeStart.setSeconds(time[2]);
        var timeEnd = new Date();
        var diff = timeDiff(timeEnd, timeStart);
        var hours = diff.hours.toString().split('.');
        var minutes = diff.minutes.toFixed(2);
        var hh = (parseInt(hours[0]) * 60) + parseInt(Math.ceil(minutes));
        
        var sum = KPI_Load - hh;
        if (sum > 15) {
            $scope.inbounds_tb1[index].style2 = 'green';

        } else if (sum <= 15) {
            $scope.inbounds_tb1[index].style2 = 'yellow';

        } else if (sum < 15) {
            $scope.inbounds_tb1[index].style2 = 'red';

        }
       $scope.inbounds_tb1[index].Time_Load = hh;
    }
    $scope.fncTimeRight = function (Plan_In, inb) {
        var plan = Plan_In.split(':');
        var d = new Date();

        var _plan = new Date();
        _plan.setHours(plan[0]);
        _plan.setMinutes(plan[1]);

        var diff = {};
        diff.milliseconds = _plan.getTime() - d.getTime();
        diff.seconds = diff.milliseconds / 1000;
        diff.minutes = diff.seconds / 60;
        var minutes = Math.ceil(diff.minutes.toFixed(1));
        if (minutes >= 15) {
            inb.style3 = 'yellow';
        } else if (minutes < 0){
            inb.style3 = 'red';
        }
    }
    $scope.vm.setPage = function (page) {
        if (page < 1 || page > $scope.vm.pager.totalPages) {
            return;
        }
        if (stop.length > 0) {
            for (var i = 0; i < stop.length; i++) {
                if (angular.isDefined(stop[i])) {
                    $interval.cancel(stop[i]);
                }
            }
            stop.length = 0;
        }
        var temp = [];
        Bussiness_Layer.gate()
            .success(function (gate) {
                Bussiness_Layer.inbound()
                    .success(function (inb) {
                        // get pager object from service
                        $scope.vm.pager = PagerService.GetPager(gate.length, page, total_Page);
                        // get current page of items
                        $scope.vm.items = gate.slice($scope.vm.pager.startIndex, $scope.vm.pager.endIndex + 1);
                        var inbounds_tb1 = [], inbounds_tb2 = [];
                        var Inb_tb2 = inb[1].slice($scope.vm.pager.startIndex, $scope.vm.pager.endIndex + 1);
                        for (var i = 0; i < total_Page; i++) {//$scope.vm.items.length
                            if (i < $scope.vm.items.length) {
                                var Inb_tb1 = inb[0].filter(function (val, index) { return val.Gate == $scope.vm.items[i].Description; });
                                if (Object.keys(Inb_tb1).length > 0) {
                                    var newObj = Inb_tb1.map(function (e) {
                                        return {
                                            Gate: e.Gate,
                                            Sku: e.Sku,
                                            Type_Car: e.Type_Car,
                                            License: e.License,
                                            Plan_In: e.Plan_In,
                                            Time_In: e.Time_In,
                                            Plan_Load: e.Plan_Load,
                                            Time_Load: '',
                                            Status_Gate: e.Status_Gate,
                                            Time_Load_Diff: e.Time_Load,
                                        };
                                    });

                                    inbounds_tb1.push(newObj[0]);
                                    temp.push({ Index: i, Gate: newObj[0].Gate});
                                } else {
                                    if (i < $scope.vm.items.length) {
                                        inbounds_tb1.push(
                                            {
                                                Gate: $scope.vm.items[i].Description,
                                                Sku: '',
                                                Type_Car: '',
                                                License: '',
                                                Plan_In: '',//.substring(0, e.planCar.length - 3)
                                                Time_In: '',
                                                Plan_Load: '',
                                                Time_Load: '',
                                                Status_Gate: '',
                                                Time_Load_Diff: '',
                                            }
                                        );
                                    } else {
                                        inbounds_tb1.push(
                                            {
                                                Gate: '',
                                                Sku: '',
                                                Type_Car: '',
                                                License: '',
                                                Plan_In: '',//.substring(0, e.planCar.length - 3)
                                                Time_In: '',
                                                Plan_Load: '',
                                                Time_Load: '',
                                                Status_Gate: '',
                                                Time_Load_Diff: '',
                                            }
                                        );
                                    }

                                }
                            } else {
                                inbounds_tb1.push(
                                    {
                                        Gate: '',
                                        Sku: '',
                                        Type_Car: '',
                                        License: '',
                                        Plan_In: '',//.substring(0, e.planCar.length - 3)
                                        Time_In: '',
                                        Plan_Load: '',
                                        Time_Load: '',
                                        Status_Gate: '',
                                        Time_Load_Diff: '',
                                    }
                                );
                            }
                            
                            if (i < Inb_tb2.length) {
                                if (Inb_tb2[i].TRST_ID == 1) {
                                    $scope.fncTimeRight(Inb_tb2[i].Plan_In, Inb_tb2[i]);
                                } else {
                                    Inb_tb2[i].style3 = '';
                                }
                                inbounds_tb2.push(Inb_tb2[i]);
                            } else {
                                inbounds_tb2.push(
                                    {
                                        Sku: '',
                                        Type_Car: '',
                                        License: '',
                                        Plan_In: '',
                                        Time_In: '',
                                        Status_Car: '',
                                    }
                                );
                            }
                        }
                        $scope.inbounds_tb1 = inbounds_tb1;
                        $scope.inbounds_tb2 = inbounds_tb2;
                    })
                    .error(function (err) { alert(err); })
                    .then(function () {
                        angular.forEach(temp, function (val, key) {
                            var obj = $scope.inbounds_tb1.filter(function (value, index) { return value.Gate == val.Gate; })[0] || {};
                            if (!angular.equals({}, obj)){
                                if ((obj.Time_In != null && obj.Time_In != '') && (obj.Plan_In != null && obj.Plan_In != '')) {
                                   var plan = obj.Plan_In.split(':');
                                   var time = obj.Time_In.split(':');
                                    
                                   var dPlan = new Date();
                                   dPlan.setHours(plan[0]);
                                   dPlan.setMinutes(plan[1]);
                                    
                                   var dTime = new Date();
                                   dTime.setHours(time[0]);
                                   dTime.setMinutes(time[1]);
                                   var diff = {};
                                   diff.milliseconds = dTime.getTime() - dPlan.getTime();
                                   diff.seconds = diff.milliseconds / 1000;
                                   diff.minutes = diff.seconds / 60;
                                   var minutes = Math.ceil(diff.minutes.toFixed(1));
                                   if (minutes >= 30) {
                                       $scope.inbounds_tb1[val.Index].style1 = 'red';
                                   } else if (minutes < 0) {
                                       $scope.inbounds_tb1[val.Index].style1 = 'yellow';
                                    }
                                //var d = new Date();

                                if (obj.Time_Load_Diff != null && obj.Time_Load_Diff != '') {
                                    if (obj.Plan_Load != null && obj.Plan_Load != '') {
                                        stop[val.Index] = $interval(function () { $scope.fncTime(obj.Plan_Load, obj.Time_Load_Diff, val.Index); }, 1000);
                                    }
                                }
                                }
                            }
                        });
                    });
            })
            .error(function (err) { alert(err); });
    }
    
    $scope.vm.setPage(1);
    $interval(function () {
        $scope.vm.setPage(j);
        j++;
        if (j == $scope.vm.pager.pages.length + 1) j = 1;
    }, 1000 * 30);
    socket.on('inbound', function (data) {
        if (Object.keys(data).length > 0) {
            angular.forEach(data, function (values, key) {
            var found = $filter('filter')($scope.inbounds_tb1, { Gate: values.Gate })[0] || {}
            var index = $scope.inbounds_tb1.indexOf(found);
            color.style1 = '';
            color.style2 = '';

            if (values.Calling_DateTime != null) {
                $scope.inbounds_tb1[index] = {
                    Gate: values.Gate,
                    Sku: values.Sku,
                    Type_Car: values.Type_Car,
                    License: values.License,
                    Plan_In: values.Plan_In,
                    Time_In: values.Time_In,
                    Plan_Load: values.Plan_Load,
                    Time_Load: values.Time_Load,
                    Status_Gate: values.Status_Gate,
                };

                if (values.Plan_In != null && values.Plan_In != '') {
                    if (values.Time_In == null && values.Time_In == '') {
                        var plan = values.Plan_In.split(':');
                        var time = values.Time_In.split(':');

                        var dPlan = new Date();
                        dPlan.setHours(plan[0]);
                        dPlan.setMinutes(plan[1]);

                        var dTime = new Date();
                        dTime.setHours(time[0]);
                        dTime.setMinutes(time[1]);
                        var diff = {};
                        diff.milliseconds = dTime.getTime() - dPlan.getTime();
                        diff.seconds = diff.milliseconds / 1000;
                        diff.minutes = diff.seconds / 60;
                        var minutes = Math.ceil(diff.minutes.toFixed(1));
                        if (minutes >= 30) {
                            $scope.inbounds_tb1[val.Index].style1 = 'red';
                        } else if (minutes < 0) {
                            $scope.inbounds_tb1[val.Index].style1 = 'yellow';
                        }
                    }
                }
            }
            if (values.Time_Load != null) {
                $scope.inbounds_tb1[index] = {
                    Gate: values.Gate,
                    Sku: values.Sku,
                    Type_Car: values.Type_Car,
                    License: values.License,
                    Plan_In: values.Plan_In,
                    Time_In: values.Time_In,
                    Plan_Load: values.Plan_Load,
                    Time_Load: values.Time_Load,
                    Status_Gate: values.Status_Gate,
                };

                if ((values.Plan_Load != null && values.Plan_Load != '')) {
                    stop[index] = $interval(function () { $scope.fncTime(values.Plan_Load, values.Time_Load, index); }, 1000);
                }
            }

            if (values.Finish_Load != null) {
                $scope.inbounds_tb1[index] = {
                    Gate: values.Gate,
                    Sku: '',
                    Type_Car: '',
                    Lisence: '',
                    Plan_In: '',
                    Time_In: '',
                    Plan_Load: '',
                    Time_Load: '',
                    Status_Gate: '',
                };
                if (angular.isDefined(stop[index])) {
                    $interval.cancel(stop[index]);
                    stop[index] = undefined;
                }
            }
            });
           
        }
    });
    socket.on('right', function (data) {
        var arr = [];
        var _data = data.slice($scope.vm.pager.startIndex, $scope.vm.pager.endIndex + 1);
        for (var i = 0; i < total_Page; i++) {
            if (i < _data.length) {
                if (_data[i].TRST_ID == 1) {
                    $scope.fncTimeRight(_data[i].Plan_In, _data[i]);
                } else {
                    _data[i].style3 = '';
                }
                arr.push(_data[i]);
            } else {
                arr.push(
                    {
                        SKU: '',
                        Type_Car: '',
                        License: '',
                        Plan_In: '',
                        Time_In: '',
                        Status_Car: '',
                    }
                );
            }
        }
        $scope.inbounds_tb2 = arr;
        arr = [];
       
    });
    //$scope.$on("$destroy", function handler() {
    //    // destruction code here
    //    $scope.inbounds_tb2 = [];
    //});
});

//app.controller('TimeCtrl', function ($scope, $interval) {
//    var tick = function () {
//        $scope.clock = Date.now();
//    }
//    tick();
//    $interval(tick, 1000);
//});

app.controller('outboundCtrl', function ($scope, Bussiness_Layer, $filter, $interval, outbound, PagerService) {

    $scope.outbounds_tb1 = [];
    $scope.outbounds_tb2 = [];
    $scope.vm = this;
    $scope.vm.pager = {};
    var total_Page = 12, j = 2;
    var stop = [];
    var timeDiff = function (date1, date2) {
        var a = new Date(date1).getTime(),
            b = new Date(date2).getTime(),
            diff = {};

        diff.milliseconds = a > b ? a % b : b % a;
        diff.seconds = diff.milliseconds / 1000;
        diff.minutes = diff.seconds / 60;
        diff.hours = diff.minutes / 60;
        diff.days = diff.hours / 24;
        diff.weeks = diff.days / 7;

        return diff;
    }
    $scope.fncTime = function (KPI_Load, Time_Load, index) {
        var arr = Time_Load.split(' ');
        var date = arr[0].split('-');
        var time = arr[1].split(':');;
        var timeStart = new Date();
        timeStart.setFullYear(date[0]);
        timeStart.setMonth(Number(date[1]) - 1);
        timeStart.setDate(date[2]);
        timeStart.setHours(time[0]);
        timeStart.setMinutes(time[1]);
        timeStart.setSeconds(time[2]);
        var timeEnd = new Date();
        var diff = timeDiff(timeEnd, timeStart);
        var hours = diff.hours.toString().split('.');
        var minutes = diff.minutes.toString().split('.');
        var hh = parseInt(minutes[0]);
        $scope.outbounds_tb1[index].Time_Load = hh;
        var sum = KPI_Load - hh;
        if (sum > 15) {
            $scope.outbounds_tb1[index].style2 = 'green';
        } else if (sum <= 15) {
            $scope.outbounds_tb1[index].style2 = 'yellow';
        } else if (sum < 15) {
            $scope.outbounds_tb1[index].style2 = 'red';
        }
    }
    $scope.fncTimeRight = function (Plan_In, outb) {
        var plan = Plan_In.split(':');
        var d = new Date();

        var _plan = new Date();
        _plan.setHours(plan[0]);
        _plan.setMinutes(plan[1]);

        var diff = {};
        diff.milliseconds = _plan.getTime() - d.getTime();
        diff.seconds = diff.milliseconds / 1000;
        diff.minutes = diff.seconds / 60;
        var minutes = Math.ceil(diff.minutes.toFixed(1));
        if (minutes >= 15) {
            outb.style3 = 'yellow';
        } else if (minutes < 0) {
            outb.style3 = 'red';
        }
    }
    $scope.vm.setPage = function (page) {
        if (page < 1 || page > $scope.vm.pager.totalPages) {
            return;
        }

        if (stop.length > 0) {
            for (var i = 0; i < stop.length; i++) {
                if (angular.isDefined(stop[i])) {
                    $interval.cancel(stop[i]);
                }
            }
            stop.length = 0;
        }
        var temp = [];
        Bussiness_Layer.gateout()
            .success(function (gate) {
                Bussiness_Layer.outbound()
                    .success(function (outb) {
                        // get pager object from service
                        $scope.vm.pager = PagerService.GetPager(gate.length, page, total_Page);
                        // get current page of items
                        $scope.vm.items = gate.slice($scope.vm.pager.startIndex, $scope.vm.pager.endIndex + 1);
                        gate = $scope.vm.items;
                        var outbounds_tb1 = [], outbounds_tb2 = [];
                        var outb_tb2 = outb[1].slice($scope.vm.pager.startIndex, $scope.vm.pager.endIndex + 1);
                        for (var i = 0; i < total_Page; i++){//$scope.vm.items.length
                            if (i < $scope.vm.items.length) {
                                var outb_tb1 = outb[0].filter(function (val, index) { return val.Gate == $scope.vm.items[i].Description; });
                                if (Object.keys(outb_tb1).length > 0) {
                                    var newObj = outb_tb1.map(function (e) {
                                       
                                        return {
                                            Gate: e.Gate,
                                            ROUT_IX: e.ROUT_IX,
                                            SHI_NO: e.SHI_NO,
                                            SEQCAR: e.SEQCAR,
                                            Type_Car: e.Type_Car,
                                            License: e.License,
                                            Plan_In: e.Plan_In,//.substring(0, e.planCar.length - 3),//e.planCar,
                                            Time_In: e.Time_In,//.substring(0, e.in.length - 3),
                                            Plan_Load: e.Plan_Load,//.substring(0, e.planLoad.length - 3),
                                            Time_Load: '',//.substring(0, e.time.length - 3),
                                            Status_Gate: e.Status_Gate,
                                            class: '',
                                            Time_Load_Diff: e.Time_Load,

                                        };
                                    });

                                    outbounds_tb1.push(newObj[0]);
                                    temp.push({ Index: i, Gate: newObj[0].Gate});
                                } else {
                                    if (i < $scope.vm.items.length) {
                                        outbounds_tb1.push(
                                            {
                                                Gate: $scope.vm.items[i].Description,
                                                ROUT_IX: '',
                                                SHI_NO: '',
                                                SEQCAR: '',
                                                Type_Car: '',
                                                License: '',
                                                Plan_In: '',//.substring(0, e.planCar.length - 3),//e.planCar,
                                                Time_In: '',//.substring(0, e.in.length - 3),
                                                Plan_Load: '',//.substring(0, e.planLoad.length - 3),
                                                Time_Load: '',//.substring(0, e.time.length - 3),
                                                Status_Gate: '',
                                                class: '',
                                            }
                                        );

                                    } else {
                                        outbounds_tb1.push(
                                            {
                                                Gate: '',
                                                ROUT_IX: '',
                                                Type_Car: '',
                                                License: '',
                                                Plan_In: '',//.substring(0, e.planCar.length - 3),//e.planCar,
                                                Time_In: '',//.substring(0, e.in.length - 3),
                                                Plan_Load: '',//.substring(0, e.planLoad.length - 3),
                                                Time_Load: '',//.substring(0, e.time.length - 3),
                                                Status_Gate: '',
                                                class: '',
                                            }
                                        );
                                    }
                                }
                            } else {
                                outbounds_tb1.push(
                                    {
                                        Gate: '',
                                        ROUT_IX: '',
                                        Type_Car: '',
                                        License: '',
                                        Plan_In: '',//.substring(0, e.planCar.length - 3),//e.planCar,
                                        Time_In: '',//.substring(0, e.in.length - 3),
                                        Plan_Load: '',//.substring(0, e.planLoad.length - 3),
                                        Time_Load: '',//.substring(0, e.time.length - 3),
                                        Status_Gate: '',
                                        class: '',
                                    }
                                );
                            }
                            if (i < outb_tb2.length) {
                                // = outb[1].filter(function (val, index) { return index == i; })[0];
                                if (outb_tb2[i].TRST_ID == 1) {
                                    $scope.fncTimeRight(outb_tb2[i].Plan_In, outb_tb2[i])
                                } else {
                                    outb_tb2[i].style3 = '';
                                }
                                outbounds_tb2.push(outb_tb2[i]);
                            } else {
                                outbounds_tb2.push(
                                    {
                                        ROUT_IX: '',
                                        Type_Car: '',
                                        License: '',
                                        Plan_In: '',
                                        Time_In: '',
                                        Status_Car: '',
                                    }
                                );
                            }
                        }
                        $scope.outbounds_tb1 = outbounds_tb1;
                        $scope.outbounds_tb2 = outbounds_tb2;
                    })
                    .error(function (err) { alert(err); })
                    .then(function () {
                        angular.forEach(temp, function (val, key) {
                            var obj = $scope.outbounds_tb1.filter(function (value, index) { return value.Gate == val.Gate; })[0];
                            if (!angular.equals({}, obj)) {
                                if (obj.Time_In != null && obj.Time_In != '') {
                                    if (obj.Plan_In != null && obj.Plan_In != ''){
                                        var plan = obj.Plan_In.split(':');
                                        var time = obj.Time_In.split(':');

                                        var dPlan = new Date();
                                        dPlan.setHours(plan[0]);
                                        dPlan.setMinutes(plan[1]);

                                        var dTime = new Date();
                                        dTime.setHours(time[0]);
                                        dTime.setMinutes(time[1]);
                                        var diff = {};
                                        diff.milliseconds = dTime.getTime() - dPlan.getTime();
                                        diff.seconds = diff.milliseconds / 1000;
                                        diff.minutes = diff.seconds / 60;
                                        var minutes = Math.ceil(diff.minutes.toFixed(1));
                                        if (minutes >= 30) {
                                            $scope.outbounds_tb1[val.Index].style1 = 'red';
                                        } else if (minutes < 0) {
                                            $scope.outbounds_tb1[val.Index].style1 = 'yellow';
                                        }

                                        if (obj.Plan_Load != null && obj.Plan_Load != '') {
                                            if (obj.Time_Load_Diff != null && obj.Time_Load_Diff != '') {
                                                var _stop = $interval(function () { $scope.fncTime(obj.Plan_Load, obj.Time_Load_Diff, val.Index); }, 1000);
                                                stop[val.Index] = _stop;
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    });
            }).error(function (err) { alert(err); });
    };
    $scope.vm.setPage(1);
    $interval(function () {
        $scope.vm.setPage(j);
        j++;
        if (j == $scope.vm.pager.pages.length + 1) j = 1;
    }, 1000 * 30);

    outbound.on('outbound', function (data) {
        if (Object.keys(data).length > 0) {
            angular.forEach(data, function (values, key) {
                var found = $filter('filter')($scope.outbounds_tb1, { Gate: values.Gate })[0] || {};
                var index = $scope.outbounds_tb1.indexOf(found);
                color.style1 = '';
                color.style2 = '';

                if (values.Calling_DateTime != null) {
                    $scope.outbounds_tb1[index] = {
                        Gate: values.Gate,
                        ROUT_IX: values.Sku,
                        SHI_NO: values.SHI_NO,
                        SEQCAR: values.SEQCAR,
                        Type_Car: values.Type_Car,
                        License: values.License,
                        Plan_In: values.Plan_In,//.substring(0, e.planCar.length - 3),//e.planCar,
                        Time_In: values.Time_In,//.substring(0, e.in.length - 3),
                        Plan_Load: values.Plan_Load,//.substring(0, e.planLoad.length - 3),
                        Time_Load: values.Time_Load,//.substring(0, e.time.length - 3),
                        Status_Gate: values.Status_Gate,
                        class: color,

                    };

                    if (values.Plan_In == null && values.Plan_In == '') {
                        if (values.Time_In == null && values.Time_In == '') {
                            var plan = values.Plan_In.split(':');
                            var time = values.Time_In.split(':');
                            var dPlan = new Date();
                            dPlan.setHours(plan[0]);
                            dPlan.setMinutes(plan[1]);

                            var dTime = new Date();
                            dTime.setHours(time[0]);
                            dTime.setMinutes(time[1]);
                            var diff = {};
                            diff.milliseconds = dTime.getTime() - dPlan.getTime();
                            diff.seconds = diff.milliseconds / 1000;
                            diff.minutes = diff.seconds / 60;
                            var minutes = Math.ceil(diff.minutes.toFixed(1));
                            if (minutes >= 30) {
                                $scope.outbounds_tb1[val.Index].style1 = 'red';
                            } else if (minutes < 0) {
                                $scope.outbounds_tb1[val.Index].style1 = 'yellow';
                            }
                        }
                    };
                }

                if (values.Time_Load != null) {
                    $scope.outbounds_tb1[index] = {
                        Gate: values.Gate,
                        ROUT_IX: values.ROUT_IX,
                        SHI_NO: values.SHI_NO,
                        SEQCAR: values.SEQCAR,
                        Type_Car: values.Type_Car,
                        License: values.License,
                        Plan_In: values.Plan_In,
                        Time_In: values.Time_In,
                        Plan_Load: values.Plan_Load,
                        Time_Load: values.Time_Load,
                        Time_Load_Diff: values.Time_Load,
                        Status_Gate: values.Status_Gate,
                    };
                    if ((values.Plan_Load == null && values.Plan_Load == '')) return;
                    stop[index] = $interval(function () { $scope.fncTime(values.Plan_Load, $scope.outbounds_tb1[index].Time_Load_Diff, index); }, 1000);
                }

                if (values.Finish_Load != null) {

                    $scope.outbounds_tb1[index] = {
                        Gate: values.Gate,
                        ROUT_IX: '',
                        SHI_NO: '',
                        SEQCAR: '',
                        Type_Car: '',
                        License: '',
                        Plan_In: '',
                        Time_In: '',
                        Plan_Load: '',
                        Time_Load: '',
                        Status_Gate: '',
                        class: { style1: '', style2: '' },
                    };

                    if (angular.isDefined(stop[index])) {
                        $interval.cancel(stop[index]);
                        stop[index] = undefined;
                    }
                }
            });
        }
    });

    //var room = "outright";
    //outbound.on('connect', function () {
    //    // Connected, let's sign-up for to receive messages for this room
    //    outbound.emit('room', room);
    //});
    outbound.on('outright', function (data) {
        var arr = [];
        var _data = data.slice($scope.vm.pager.startIndex, $scope.vm.pager.endIndex + 1);
        for (var i = 0; i < total_Page; i++) {
            if (i < _data.length) {
                if (_data[i].TRST_ID == 1) {
                    $scope.fncTimeRight(_data[i].Plan_In, _data[i])
                } else {
                    _data[i].style3 = '';
                }
                arr.push(_data[i]);
            } else {
                arr.push(
                    {
                        ROUT_IX: '',
                        Type_Car: '',
                        License: '',
                        Plan_In: '',
                        Time_In: '',//.substring(0, e.planCar.length - 3),//e.planCar,
                        Plan_Out: '',
                        Time_Out: '',
                        Status_Car: '',//.substring(0, e.planLoad.length - 3),
                    }
                );
            }
        }
        //angular.forEach(gate, function (value, key) {

        //       if (key <= total_Page) {
        //            arr.push(data[key]);
        //        } else {
        //            arr.push(
        //                {
        //                    ROUT_IX: '',
        //                    Type_Car: '',
        //                    License: '',
        //                    Plan_In: '',
        //                    Time_In: '',//.substring(0, e.planCar.length - 3),//e.planCar,
        //                    Plan_Out: '',
        //                    Time_Out: '',
        //                    Status_Car: '',//.substring(0, e.planLoad.length - 3),
        //                }
        //            );
        //        }
        //});
        $scope.outbounds_tb2 = arr;
        arr = [];
        // outbound.emit('forceDisconnect');
    });
});

