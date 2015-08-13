(function () {
    'use strict';

    angular
        .module('orange')
        .controller('TodayCtrl', TodayCtrl);

    TodayCtrl.$inject = ['$q', '$scope', '$ionicLoading', '$cordovaDialogs', 'log'];

    function TodayCtrl($q, $scope, $ionicLoading, $cordovaDialogs, log) {
        var vm = this;

        vm.schedule = null;

        vm.medications = null;

        vm.filters = [
            {
                name: 'Skipped',
                f: function(elem) {
                    return elem.happened && !elem.took_medication && !_.isUndefined(elem.dose_id);
                },
                type: 'skipped',
                events: []
            },
            {
                name: 'Past',
                f: function(elem) {
                    return elem.happened && _.isUndefined(elem.dose_id);
                },
                type: 'undefined',
                events: []
            },
            {
                name: 'Taken',
                f: {happened: true, took_medication: true},
                type: 'taken',
                buttons: '',
                events: []
            },
            {
                name: 'Due',
                f: {happened: false},
                type: 'undefined',
                events: []
            }
        ];

        vm.refresh = refresh;
        vm.createDose = createDose;

        refresh();

        function createDose(event) {
            console.log(event);
        }

        function refresh() {
            var date = moment();
            var filter = {
                //start_date: date.format('YYYY-MM-DD'),
                end_date: date.format('YYYY-MM-DD')
            };
            $q.all([log.all('schedule').getList(filter), log.all('medications').getList()])
                .then(
                function (data) {
                    //console.log(schedule);
                    vm.schedule = data[0].plain();
                    vm.medications = data[1].plain();
                    vm.schedule.forEach(function (elem) {
                        elem.medication = _.find(vm.medications, {id: elem.medication_id});

                        if (!_.isUndefined(elem.scheduled)) {
                            elem.event = _.find(elem.medication.schedule.times, {id: elem.scheduled});
                            console.log(elem.date, elem.event);
                        }
                    });

                    vm.filters.forEach(function(filter) {
                        filter.events = _.filter(vm.schedule, filter.f);
                    })
                },
                function (error) {
                    console.log(error);
                }
            ).finally(
                function () {
                    $scope.$broadcast('scroll.refreshComplete');
                    $ionicLoading.hide();
                })
        }
    }
})();
