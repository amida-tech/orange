(function () {
    "use strict";

    angular
        .module('orange')
        .controller('LogHabitsCtrl', LogHabitsCtrl);

    LogHabitsCtrl.$inject = ['$scope', '$ionicLoading', '$state', '$stateParams', 'PatientService'];

    /* @ngInject */
    function LogHabitsCtrl($scope, $ionicLoading, $state, $stateParams, PatientService) {

        var vm = this;
        PatientService.getItem($stateParams['patient_id']).then(function (patient) {
            vm.log = patient;
        });

        $scope.$watch('habits.log.habits', function(value) {
            vm.oldHabits = angular.copy(value);
            vm.log.habits = PatientService.fillHabits(value);
        });

        vm.habitsForm = {};
        vm.submit = submit;

        function submit() {
            vm.errors = [];
            if (vm.habitsForm.$valid) {
                $ionicLoading.show({
                    template: 'Saving...'
                });
                vm.log.habits.tz = PatientService.getTZName();
                vm.log.habits.save().then(
                    function () {
                        $ionicLoading.hide();
                        $state.go('onboarding-log.medications.list', $stateParams);
                    },
                    function (error) {
                        $ionicLoading.hide();
                        vm.errors = _.map(error.data.errors, _.startCase);
                    });
            } else {
                vm.errors = ['Please fill all habits'];
            }
        }
    }
})();
