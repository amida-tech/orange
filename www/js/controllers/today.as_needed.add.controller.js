(function () {
    'use strict';

    angular
        .module('orange')
        .controller('TodayAsNeededAddCtrl', TodayAsNeededAddCtrl);

    TodayAsNeededAddCtrl.$inject = ['$scope', '$state', '$stateParams', '$ionicLoading', 'patient', 'n2w'];

    function TodayAsNeededAddCtrl($scope, $state, $stateParams, $ionicLoading, patient, n2w) {
        var vm = this;
        vm.medicationsPromise = $scope.medications;

        vm.medication = _.find($scope.medications.$object, function(medication) {
            return medication.id == $stateParams.id
        });

        vm.takenText = getTakenText(vm.medication);

        function getTakenText(medication) {
            var result = '';

            if (_.isEmpty(medication)) {
                return result;
            }

            result += _.capitalize(n2w.toWords(medication.dose.quantity || 0));
            result += ' unit' + (medication.dose.quantity === 1 ? '' : 's');
            if (medication.schedule.take_with_food !== null) {
                result += ', taken ' + (medication.schedule.take_with_food ? 'with': 'without') + ' food'
            }
            return result            
        }

        vm.date = moment();
        vm.dose = {
            medication_id: $stateParams.id,
            date: vm.date.format(),
            taken: true
        };

        $scope.$watch('medications.$$state.status', function(newValue, oldValue) {
            if (newValue) {
                vm.medication = _.find($scope.medications.$object, function(medication) {
                    return medication.id == $stateParams.id
                });
                vm.takenText = getTakenText(vm.medication);
            }
        });

        vm.createDose = function() {
            $ionicLoading.show({template: 'Save Intake...'});
            patient.all('doses').post(vm.dose).then(function() {
                $ionicLoading.hide();
                $state.go('app.today.schedule')
            });
        }

    }
})();
