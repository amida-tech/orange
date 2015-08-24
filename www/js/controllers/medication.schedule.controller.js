(function () {
    "use strict";

    angular
        .module('orange')
        .controller('MedicationScheduleCtrl', MedicationScheduleCtrl);

    MedicationScheduleCtrl.$inject = ['$scope', '$state', '$ionicPopup', '$ionicLoading', 'medications'];

    /* @ngInject */
    function MedicationScheduleCtrl($scope, $state, $ionicPopup, $ionicLoading, medications) {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.title = 'MedicationScheduleCtrl';
        vm.buttonText = null;
        vm.schedule = null;
        vm.eventsCount = null;

        vm.nextUrl = $state.current.name === 'onboarding-log.medications.schedule' ? 'onboarding-log.medications.events' : 'app.medication.events';
        vm.returnUrl = $state.current.name === 'onboarding-log.medications.schedule' ? 'onboarding-log.medications.list' : 'app.medications';


        vm.selectedRegularity = undefined;
        vm.regularity = [
            {name: 'As Needed', key: 'as_needed'},
            {name: 'On a Schedule', key: 'regularly'},
            {name: 'Both', key: 'both'}
        ];
        $scope.$watch('schedule.selectedRegularity', regularityChanged);

        vm.duration = [
            {name: 'Ongoing', key: 'forever'},
            {name: '# of Times', key: 'number'},
            {name: 'Until Set Date', key: 'date'}
        ];
        $scope.$watch('schedule.schedule.until.type', durationChanged);

        vm.selectedFrequency = undefined;
        vm.frequency = [
            {name: 'Daily', key: 'daily'},
            {name: 'Weekly', key: 'weekly'},
            {name: 'Monthly', key: 'monthly'}
        ];
        $scope.$watch('schedule.selectedFrequency', frequencyChanged);

        vm.withFood = [
            {name: 'Yes', key: true},
            {name: 'No', key: false},
            {name: 'Doesn\'t Matter', key: null}
        ];

        activate();

        vm.continue = function () {
            if (vm.schedule.regularly === false) {
                delete vm.schedule.until;
                delete vm.schedule.frequency;
                // save and go to medication details
                medications.setMedicationSchedule(vm.schedule);
                $ionicLoading.show({
                    template: 'Saving…'
                });
                medications.saveMedication().then(
                    function(data) {
                        $ionicLoading.hide();
                        if (!data.success) {
                            $ionicPopup.alert({
                                title: 'Error',
                                template: data.data.errors,
                                okType: 'button-dark-orange'
                            });
                        }
                        $state.go(vm.returnUrl);
                    }
                ).finally(
                    function() {
                        $ionicLoading.hide();
                        $state.go(vm.returnUrl);
                    }
                );
            } else {
                // prepare events and go to configure events
                var events = vm.schedule.times || [];
                events = events.slice(0, vm.eventsCount);
                for (var i = events.length; i < vm.eventsCount; i++) {
                    events.push({
                        type: 'event',
                        event: 'breakfast',
                        when: 'before'
                    });
                }
                vm.schedule.times = events;
                medications.setMedicationSchedule(vm.schedule);
                $state.go(vm.nextUrl);
            }
            //console.log(vm.schedule);
            //console.log(vm.eventsCount);
            //$state.go('app.medication.events');
        };

        ////////////////

        function activate() {
            $scope.$watch(medications.getMedication, function (medication) {
                if (medication && medication.schedule !== vm.schedule) {
                    console.log('Schedule changed', medication.schedule);
                    update(angular.copy(medication.schedule));
                }
            });
        }

        function update(schedule) {
            vm.schedule = schedule;

            // Update regularity
            if (vm.schedule.as_needed && vm.schedule.regularly) {
                vm.selectedRegularity = 'both';
            } else if (schedule.regularly) {
                vm.selectedRegularity = 'regularly';
            } else {
                vm.selectedRegularity = 'as_needed'
            }

            // Update frequency
            if (vm.schedule.frequency) {
                if (vm.schedule.frequency.unit === 'day' && vm.schedule.frequency.exclude) {
                    console.log(vm.schedule.frequency.unit, vm.schedule.frequency.exclude);
                    vm.selectedFrequency = 'weekly';
                } else if (vm.schedule.frequency.unit === 'month') {
                    vm.selectedFrequency = 'monthly';
                } else {
                    vm.selectedFrequency = 'daily';
                }
            }

            vm.eventsCount = (vm.schedule.times && vm.schedule.times.length) || 1;
        }

        function regularityChanged(newValue) {
            switch (newValue) {
                case 'as_needed':
                    vm.schedule.as_needed = true;
                    vm.schedule.regularly = false;
                    vm.buttonText = 'Save';
                    break;
                case 'regularly':
                    vm.schedule.as_needed = false;
                    vm.schedule.regularly = true;
                    vm.buttonText = 'Continue';
                    break;
                case 'both':
                    vm.schedule.as_needed = true;
                    vm.schedule.regularly = true;
                    vm.buttonText = 'Continue';
                    break;
            }

            if (vm.schedule && vm.schedule.regularly === true) {
                if (!vm.schedule.until) {
                    vm.schedule.until = {
                        type: 'forever'
                    };
                }
                if (!vm.schedule.frequency) {
                    vm.schedule.frequency = {
                        unit: 'day',
                        n: 1
                    };
                    vm.selectedFrequency = 'daily';
                }
            }
        }

        function durationChanged(newValue) {
            switch (newValue) {
                case 'forever':
                    delete vm.schedule.until.stop;
                    break;
                case 'number':
                    if (!_.isNumber(vm.schedule.until.stop)) {
                        vm.schedule.until.stop = 1;
                    }

                    break;
                case 'date':
                    if (!_.isString(vm.schedule.until.stop)) {
                        vm.schedule.until.stop = moment().format('YYYY-MM-DD');
                    }
                    break;
            }
        }

        function frequencyChanged(newValue) {
            var frequency;
            switch (newValue) {
                case 'daily':
                    console.log('daily');
                    frequency = {
                        unit: 'day',
                        n: (vm.schedule.frequency && vm.schedule.frequency.unit === 'day' && vm.schedule.frequency.n) || 1
                    };
                    vm.schedule.frequency = frequency;
                    break;
                case 'weekly':
                    console.log('weekly');
                    frequency = {
                        unit: 'day',
                        n: 1,
                        exclude: {
                            exclude: [1, 2, 3, 4, 5, 6],
                            repeat: 7
                        },
                        start: moment().day(0)
                    };
                    if (vm.schedule.frequency.exclude && vm.schedule.frequency.exclude.exclude.length) {
                        frequency.exclude.exclude = vm.schedule.frequency.exclude.exclude;
                        frequency.start = vm.schedule.frequency.start;
                    }
                    vm.schedule.frequency = frequency;
                    break;
                case 'monthly':
                    console.log('monthly');
                    frequency = {
                        n: 1,
                        unit: 'month',
                        start: (_.isArray(vm.schedule.frequency.start) && vm.schedule.frequency.start) || [moment().month(0).format('YYYY-MM-DD')]
                    };
                    vm.schedule.frequency = frequency;
                    break;
            }
        }
    }
})();