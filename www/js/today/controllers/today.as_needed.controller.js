(function () {
    'use strict';

    angular
        .module('orange')
        .controller('TodayAsNeededCtrl', TodayAsNeededCtrl);

    TodayAsNeededCtrl.$inject = ['$scope', '$state', 'MedicationService'];

    function TodayAsNeededCtrl($scope, $state, MedicationService) {
        var vm = this;

        var _filterMedications = function(medications) {
            return _.filter(medications, function(medication) {
                return medication.schedule.as_needed;
            });
        };

        vm.medicationsPromise = MedicationService.getItems();
        vm.medications = [];

        $scope.$watch('medications.$$state.status', function(newValue, oldValue) {
            if (newValue) {
                vm.medications = _filterMedications($scope.medications.$object);
            }
        });

        vm.refresh = function() {
            vm.medicationsPromise.then(
                function (medications) {
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.medications = _filterMedications(medications);
                    vm.medications = $scope.medications;
                }
            )
        };

        vm.refresh();

        vm.medicationClick = function(id, $event) {
            if ($event.target.tagName == 'SPAN') {
                return;
            }

            $state.go('app.today.as_needed_add', {id: id})
        }
    }
})();
