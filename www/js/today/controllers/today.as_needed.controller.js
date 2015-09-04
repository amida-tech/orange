(function () {
    'use strict';

    angular
        .module('orange')
        .controller('TodayAsNeededCtrl', TodayAsNeededCtrl);

    TodayAsNeededCtrl.$inject = ['$scope', 'MedicationService'];

    function TodayAsNeededCtrl($scope, MedicationService) {
        var vm = this;

        var _filterMedications = function(medications) {
            return _.filter(medications, function(medication) {
                return medication.schedule.as_needed;
            });
        };

        vm.medicationsPromise = $scope.medications;
        vm.medications = [];

        $scope.$watch('medications.$$state.status', function(newValue, oldValue) {
            if (newValue) {
                vm.medications = _filterMedications($scope.medications.$object);
            }
        });

        vm.refresh = function() {
            MedicationService.getItems().then(
                function (medications) {
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.medications = _filterMedications(medications);
                    vm.medications = $scope.medications;
                }
            )
        }

    }
})();
