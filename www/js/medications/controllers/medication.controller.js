(function () {
    "use strict";

    angular
        .module('orange')
        .controller('MedicationCtrl', MedicationCtrl);

    MedicationCtrl.$inject = ['$state', '$stateParams', '$ionicLoading', '$ionicPopup', 'MedicationService'];

    function MedicationCtrl($state, $stateParams, $ionicLoading, $ionicPopup, MedicationService) {
        var vm = this;
        vm.medicationStatusMap = {
            manual: 'Manually Entered',
            import: 'Automatic Imported'
        };
        vm.title = 'Medication Details';
        MedicationService.getItem($stateParams['id']).then(function (medication) {
            vm.medication = medication;
            vm.eventsText = MedicationService.getMedicationText(vm.medication);
        });
        vm.getEventText = MedicationService.getEventText.bind(MedicationService);
        vm.remove = remove;

        function remove(medication) {
            $ionicPopup.confirm({
                title: 'Delete Medication',
                template: 'Are you sure you want to delete this medication?',
                okType: 'button-orange'
            }).then(function (confirm) {
                if (confirm) {
                    $ionicLoading.show({
                        template: 'Deleting…'
                    });

                    MedicationService.removeItem(medication).then(function () {
                        MedicationService.setItem(null);
                        $state.go('app.medications');
                    }).finally($ionicLoading.hide);
                }
            });
        }
    }
})();
