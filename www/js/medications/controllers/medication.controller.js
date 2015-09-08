(function () {
    "use strict";

    angular
        .module('orange')
        .controller('MedicationCtrl', MedicationCtrl);

    MedicationCtrl.$inject = ['$state', '$stateParams', '$ionicLoading', 'MedicationService'];

    function MedicationCtrl($state, $stateParams, $ionicLoading, MedicationService) {
        var vm = this;

        vm.title = 'Medication Details';
        MedicationService.getItem($stateParams['id']).then(function (medication) {
            vm.medication = medication;
            vm.eventsText = MedicationService.getMedicationText(vm.medication);
        });
        vm.getEventText = MedicationService.getEventText.bind(MedicationService);
        vm.remove = remove;

        function remove(medication) {
            $ionicLoading.show({
                template: 'Deleting…'
            });
            MedicationService.removeItem(medication).then(
                undefined,
                function (error) {
                    console.log(error);
                }
            ).finally(function () {
                $ionicLoading.hide();
                $state.go('app.medications');
            });
        }
    }
})();
