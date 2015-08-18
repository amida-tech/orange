(function () {
    "use strict";

    angular
        .module('orange')
        .controller('MedicationEventsCtrl', MedicationEventsCtrl);

    MedicationEventsCtrl.$inject = ['$scope', 'medications'];

    /* @ngInject */
    function MedicationEventsCtrl($scope, medications) {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.title = 'MedicationEventsController';

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

        function activate() {
            console.log('MedicationEventsController activated!');
            $scope.$watch(medications.getMedication, function (medication) {
                if (medication && medication.schedule && medication.schedule.times !== vm.events) {
                    console.log('Events changed', medication.schedule.times);
                    update(angular.copy(medication.schedule.times));
                }
            });
        }

        function update(events) {
            vm.events = _.map(events, function (event) {
                event.text = medications.getEventText(event);
                if (event.type === 'event' && ['breakfast', 'lunch', 'dinner'].indexOf(event.event) !== -1) {
                    event.eventType = 'meal';
                } else if (event.type === 'event') {
                    event.eventType = 'sleep';
                    event.event = event.when === 'after' ? 'wake' : 'sleep';
                } else {
                    event.eventType = 'exact';
                }
                return event;
            });
            console.log(vm.events);

        }


    }
})();
