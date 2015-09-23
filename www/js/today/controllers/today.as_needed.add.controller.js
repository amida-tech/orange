(function () {
    'use strict';

    angular
        .module('orange')
        .controller('TodayAsNeededAddCtrl', TodayAsNeededAddCtrl);

    TodayAsNeededAddCtrl.$inject = ['$state', '$stateParams', '$ionicLoading',
        'MedicationService', 'DoseService', 'n2w', 'GlobalService'];

    function TodayAsNeededAddCtrl($state, $stateParams, $ionicLoading, MedicationService, DoseService, n2w,
                                  GlobalService) {
        var vm = this;
        vm.date = moment();
        vm.dose = {
            medication_id: $stateParams.id,
            date: vm.date.format(),
            taken: true
        };

        MedicationService.getItem($stateParams['id']).then(function (medication) {
            vm.medication = medication;
            vm.dose.dose = angular.copy(vm.medication.dose);
            vm.takenText = getTakenText(vm.medication);
        });

        function getTakenText(medication) {
            var result = '';

            if (_.isEmpty(medication)) {
                return result;
            }

            result += _.capitalize(n2w.toWords(medication.dose.quantity || 0));
            result += ' ' + medication.dose.unit;
            if (medication.schedule.take_with_food !== null) {
                result += ', take ' + (medication.schedule.take_with_food ? 'with': 'without') + ' food'
            }
            return result;
        }



        vm.createDose = function() {
            $ionicLoading.show({template: 'Save Intake...'});
            DoseService.saveItem(vm.dose).then(function () {
                $ionicLoading.hide();
                $state.go('app.today.schedule')
            });
        };

        vm.back = function () {
            GlobalService.showConfirm('All changes will discard. Continue?').then(
                function (confirm) {
                    if (confirm) {
                        $state.go('app.today.as_needed');
                    }
                }
            );
        };
    }
})();
