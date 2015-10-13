(function () {
    'use strict';

    angular
        .module('orange')
        .controller('MedicationAddCtrl', MedicationAddCtrl);

    MedicationAddCtrl.$inject = ['$state', 'MedicationService'];

    function MedicationAddCtrl($state, MedicationService) {
        var vm = this;
        vm.schedule = schedule;
        vm.errors = [];
        vm.backState = $state.params['backState'];

        vm.medication = {
            access_anyone: 'write',
            access_family: 'write',
            access_prime: 'write',
            name: '',
            brand: '',
            origin: 'manual',
            schedule: {
                as_needed: true
            }
        };
        /**
         * Save pharmacy
         * @param form
         */
        function schedule(form) {
            form.$submitted = true;
            if (_.isEmpty(form.$error)) {
                MedicationService.setItem(vm.medication);
                $state.go($state.params['nextState'], {backState: $state.current.name});
            }
        }
    }
})();
