(function () {
    'use strict';

    angular
        .module('orange')
        .controller('TodayCtrl', TodayCtrl);

    TodayCtrl.$inject = ['$q', '$scope', 'log'];

    function TodayCtrl($q, $scope, log) {
        var vm = this;

        vm.schedule = null;

        vm.medications = null;

        vm.filters = [
            {
                name: 'Skipped',
                f: {happened: true, took_medication: false},
                buttons: '<i class="icon ion-ios-close dark-red"></i>',
                events: []
            },
            {
                name: 'Taken',
                f: {happened: true, took_medication: true},
                buttons: '<i class="icon ion-ios-checkmark green"></i>',
                events: []
            },
            {
                name: 'Due',
                f: {happened: false},
                buttons: '<i class="icon ion-ios-checkmark-outline green"></i> ' +
                '<i class="icon ion-ios-close-outline dark-red"></i>',
                events: []
            }
        ];

        vm.refresh = refresh;

        refresh();

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
                })
        }
    }
})();
