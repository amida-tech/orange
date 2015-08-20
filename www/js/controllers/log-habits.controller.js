(function () {
    "use strict";

    angular
        .module('orange')
        .controller('LogHabitsCtrl', LogHabitsCtrl);

    LogHabitsCtrl.$inject = ['$ionicLoading', '$state', '$stateParams', 'LogService', 'habits', 'patient'];

    /* @ngInject */
    function LogHabitsCtrl($ionicLoading, $state, $stateParams, LogService, habits, patient) {

        var vm = this;
        vm.habits = habits;
        vm.log = patient;

        vm.habitsForm = {};
        vm.submit = submit;

        function submit() {
            vm.errors = [];
            if (vm.habitsForm.$valid) {
                $ionicLoading.show({
                    template: 'Saving...'
                });
                vm.habits.tz = LogService.getTZName();
                vm.habits.save().then(
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

        function getTZName() {
            var tz = jstz.determine();
            var m = moment();
            return m.utcOffset() === 360 ? 'Asia/Novosibirsk' : tz.name();
        }
    }
})();
