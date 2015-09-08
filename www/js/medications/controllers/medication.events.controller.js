(function () {
    "use strict";

    angular
        .module('orange')
        .controller('MedicationEventsCtrl', MedicationEventsCtrl);

    MedicationEventsCtrl.$inject = ['$state', '$stateParams', '$ionicPopup', '$ionicLoading', 'MedicationService'];

    /* @ngInject */
    function MedicationEventsCtrl($state, $stateParams, $ionicPopup, $ionicLoading, MedicationService) {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.notifications = null;
        vm.events = null;
        vm.save = save;
        vm.toggleEvent = toggleEvent;
        vm.title = 'Events';
        vm.buttonText = 'Schedule';

        vm.nextUrl = $state.current.name === 'onboarding-log.medications.events' ? 'onboarding-log.medications.list' : 'app.medications';
        vm.returnUrl = $state.current.name === 'onboarding-log.medications.events' ? 'onboarding-log.medications.list' : 'app.medications';


        vm.eventTypes = [
            {name: 'Around a Meal', key: 'meal'},
            {name: 'As a Set Time', key: 'exact'},
            {name: 'Morning/Night', key: 'sleep'}
        ];

        vm.when = [
            {name: 'Before', key: 'before'},
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
            event.show = !event.show;
            if (!event.show) {
                event = prepareEvent(cleanEvent(event));
            } else {
                vm.buttonText = 'Schedule';
                vm.events.forEach(function (elem) {
                    if (elem !== event) {
                        if (elem.show) {
                            elem = prepareEvent(cleanEvent(elem));
                        }
                        elem.show = false;
                    }
                })
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
                        MedicationService.setNotifications(_.map(vm.notifications, Number)).finally(
                            function () {
                                $ionicLoading.hide();
                                $state.go(vm.nextUrl);
                            }
                        )
                    },
                    function (error) {
                        $ionicLoading.hide();
                        $ionicPopup.alert({
                            title: 'Error',
                            template: error.data.errors,
                            okType: 'button-dark-orange'
                        });
                        $state.go(vm.nextUrl);
                    }
                )
            }
            vm.buttonText = switched ? 'Schedule' : 'Save';
        }

        function nextEvent() {
            var switched = false;
            var current = _.find(vm.events, {show: true});
            if (current) {
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
            //delete event.id;
            delete event.notification;
            return event;
        }

        function prepareEvent(event) {
            event.text = MedicationService.getEventText(event);
            event.notification = 30;
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
                    update(angular.copy(medication.schedule.times));
                } else {
                    update([]);
                }
            });
        }

        function update(events) {
            vm.notifications = [];
            vm.events = _.map(events, function (event, index) {
                vm.notifications[index] = '30';
                return prepareEvent(event);
            });

            vm.events.length && toggleEvent(vm.events[0]);
        }
    }
})();
