(function () {
    "use strict";

    angular
        .module('orange')
        .controller('MedicationEventsCtrl', MedicationEventsCtrl);

    MedicationEventsCtrl.$inject = ['$state', '$stateParams', '$ionicLoading', 'MedicationService', 'GlobalService'];

    /* @ngInject */
    function MedicationEventsCtrl($state, $stateParams, $ionicLoading, MedicationService, GlobalService) {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.notifications = null;
        vm.times = [];
        vm.events = null;
        vm.save = save;
        vm.toggleEvent = toggleEvent;
        vm.title = 'Events';
        vm.buttonText = 'Schedule';

        vm.nextUrl = $state.current.name === 'onboarding-log.medications.events' ? 'onboarding-log.medications.list' : 'app.medications';
        vm.returnUrl = $state.current.name === 'onboarding-log.medications.events' ? 'onboarding-log.medications.list' : 'app.medications';
        vm.backUrl = $state.current.name === 'onboarding-log.medications.events' ? 'onboarding-log.medications.schedule' : 'app.medication.schedule';


        vm.eventTypes = [
            {name: 'Around a Meal', key: 'meal'},
            {name: 'At a Set Time', key: 'exact'},
            {name: 'Morning/Night', key: 'sleep'}
        ];

        vm.when = [
            {name: 'Before', key: 'before'},
            {name: 'During', key: 'during'},
            {name: 'After', key: 'after'}
        ];

        vm.meals = [
            {name: 'Breakfast', key: 'breakfast'},
            {name: 'Lunch', key: 'lunch'},
            {name: 'Dinner', key: 'dinner'}
        ];

        vm.sleep = [
            {name: 'After Wake', key: 'wake'},
            {name: 'Before Sleep', key: 'sleep'}
        ];

        activate();

        ////////////////

        function toggleEvent(event) {

            if (event.show) {
                if (event.eventType === 'exact' && !event.time) {
                    event.hasError = true;
                    return;
                }
                event = prepareEvent(cleanEvent(event));
                event.text = MedicationService.getEventText(event);
                event.show = false;
            } else {
                vm.buttonText = 'Schedule';
                var current = _.find(vm.events, {show: true});

                if (current) {
                    if (current.eventType === 'exact' && !current.time) {
                        current.hasError = true;
                        return;
                    }
                    current = prepareEvent(cleanEvent(current));
                    current.text = MedicationService.getEventText(current);
                    current.show = false;
                }
                event.show = true;
            }
        }

        function save(medication) {
            var switched = nextEvent();
            if (vm.buttonText === 'Save') {
                $ionicLoading.show({
                    template: 'Saving…'
                });

                var events = _.map(angular.copy(vm.events), cleanEvent);
                MedicationService.setMedicationEvents(events);


                MedicationService.saveItem(medication).then(
                    function () {
                        MedicationService.setNotifications(_.map(vm.notifications, function(item) {
                            return _.isNumber(item) ? parseInt(item) : item;
                        })).finally(
                            function () {
                                $ionicLoading.hide();
                                $state.go(vm.nextUrl);
                            }
                        )
                    },
                    function (error) {
                        $ionicLoading.hide();
                        if (error.data.errors[0] !== MedicationService.errorItemNotFound) {
                            GlobalService.showError(error.data.errors[0]).then(function () {
                                $state.go(vm.nextUrl);
                            });
                        } else {
                            $state.go('app.medications');
                        }
                    }
                )
            }
            vm.buttonText = switched ? 'Schedule' : 'Save';
        }

        function nextEvent() {
            var switched = false;
            var current = _.find(vm.events, {show: true});
            if (current) {
                if (current.eventType === 'exact' && !current.time) {
                    current.hasError = true;
                    return true;
                }
                var currentIndex = vm.events.indexOf(current);
                if (currentIndex < vm.events.length - 1) {
                    toggleEvent(vm.events[currentIndex]);
                    toggleEvent(vm.events[currentIndex + 1]);
                    switched = true;
                } else {
                    toggleEvent(current);
                }
            }
            return switched;
        }

        function cleanEvent(event) {
            switch (event.eventType) {
                case 'meal':
                    event.type = 'event';
                    delete event.time;
                    break;
                case 'exact':
                    event.type = 'exact';
                    delete event.event;
                    delete event.when;
                    break;
                case 'sleep':
                    event.type = 'event';
                    event.when = event.event === 'sleep' ? 'before' : 'after';
                    event.event = 'sleep';
                    delete event.time;
                    break;
            }
            delete event.eventType;
            delete event.text;
            delete event.show;
            delete event.hasError;
            //delete event.id;
            delete event.notification;
            delete event.notificationText;
            return event;
        }

        function prepareEvent(event) {
            if (!_.isUndefined(event.id)) {
                event.text = MedicationService.getEventText(event);
            }

            //event.notification = '30';
            if (event.type === 'event' && ['breakfast', 'lunch', 'dinner'].indexOf(event.event) !== -1) {
                event.eventType = 'meal';
            } else if (event.type === 'event') {
                event.eventType = 'sleep';
                event.event = event.when === 'after' ? 'wake' : 'sleep';
            } else {
                event.eventType = 'exact';
            }

            return event;
        }

        function clean(events) {
            return _.map(angular.copy(events), cleanEvent)
        }

        function activate() {
            console.log('MedicationEventsController activated!');
            MedicationService.getItem($stateParams['id']).then(function (medication) {
                if (medication && medication.schedule && medication.schedule.times !== vm.events) {
                    console.log('Events changed', medication.schedule.times);
                    if (medication.id) {
                        MedicationService.getNotifications().then(function (times) {
                            vm.times = times;
                            update(angular.copy(medication.schedule.times));
                        });
                    } else {
                        update(angular.copy(medication.schedule.times));
                    }

                } else {
                    update([]);
                }
            });
        }

        function update(events) {
            vm.notifications = [];
            vm.events = _.map(events, function (event, index) {
                if (vm.times.length && !_.isUndefined(vm.times[index])) {
                    vm.notifications[index] = vm.times[index].user.toString() || '30';
                    if (vm.notifications[index] === 'default') {
                        vm.notifications[index] = '30';
                    }
                } else {
                    vm.notifications[index] = '30';
                }
                return prepareEvent(event);
            });

            vm.events.length && toggleEvent(vm.events[0]);
        }
    }
})();
