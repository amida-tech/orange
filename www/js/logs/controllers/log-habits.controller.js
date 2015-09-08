(function () {
    "use strict";

    angular
        .module('orange')
        .controller('LogHabitsCtrl', LogHabitsCtrl);

    LogHabitsCtrl.$inject = ['$ionicLoading', '$state', '$stateParams', 'PatientService'];

    /* @ngInject */
    function LogHabitsCtrl($ionicLoading, $state, $stateParams, PatientService) {

        var vm = this;
        PatientService.getItem($stateParams['id']).then(function (patient) {
            vm.log = patient;
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
                        error.data.errors.forEach(function (elem) {
                            vm.errors.push(_.startCase(elem))
                        });
                    });
            } else {
                vm.errors.push('Please fill all habits');
            }
        }
    }
})();
