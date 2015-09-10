(function () {
    "use strict";
    angular
        .module('orange')
        .controller('MedicationsCtrl', MedicationsCtrl);

    MedicationsCtrl.$inject = ['$scope', '$state', '$ionicModal', 'MedicationService', 'PatientService', 'GlobalService'];

    /* @ngInject */
    function MedicationsCtrl($scope, $state, $ionicModal, MedicationService, PatientService, GlobalService) {
        var vm = this;

        vm.medications = null;
        vm.refresh = refresh;
        vm.loadMore = loadMore;
        vm.details = details;
        vm.pickMedication = pickMedication;
        vm.showSearchModal = showSearchModal;

        refresh();

        $ionicModal.fromTemplateUrl('templates/medications/medications.search.modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            vm.searchModal = modal
        });

        function pickMedication(medication, $event) {
            if ($event.target.tagName == 'SPAN') {
                return;
            }

            console.log('Medication picked:', medication);
            vm.searchModal.hide();
            MedicationService.setItem(medication);
            $state.go('app.medication.schedule');
        }

        function refresh() {
            vm.medicationsPromise = MedicationService.getItems(true);
            vm.medicationsPromise.then(
                function (medications) {
                    $scope.$broadcast('scroll.refreshComplete');
                    vm.medications = medications;
                }
            )
        }

        function loadMore() {
            var morePromise = MedicationService.moreItems();
            if (vm.medications !== null && morePromise) {
                morePromise.then(function (items) {
                    vm.medications = items;
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        }

        function details(medication, $event) {
            if ($event.target.tagName == 'SPAN') {
                return;
            }
            MedicationService.setItem(medication);
            $state.go('app.medication.details', {id: medication.id})
        }

        function showSearchModal() {
            if (checkHabits()) {
                vm.searchModal.show();
            } else {
                GlobalService.showConfirm(
                    'You have not filled Habits. Do you want to edit them?',
                    'Invalid Habits'
                ).then(function (confirm) {
                    if (confirm) {
                        PatientService.setItem(PatientService.currentPatient);
                        $state.go('app.logs.edit', {
                            id: PatientService.currentPatient.id,
                            nextState: 'app.medications',
                            fromMedication: true
                        });
                    }
                });
            }
        }

        function checkHabits() {
            var habits = PatientService.currentPatient.habits;
            return _.all([
                habits['wake'],
                habits['breakfast'],
                habits['lunch'],
                habits['dinner'],
                habits['sleep']
            ]);
        }
    }
})();


