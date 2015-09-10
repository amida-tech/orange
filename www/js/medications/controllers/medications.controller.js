(function () {
    "use strict";
    angular
        .module('orange')
        .controller('MedicationsCtrl', MedicationsCtrl);

    MedicationsCtrl.$inject = ['$scope', '$state', '$ionicLoading', '$ionicModal', 'MedicationService'];

    /* @ngInject */
    function MedicationsCtrl($scope, $state, $ionicLoading, $ionicModal, MedicationService) {
        var vm = this;

        vm.medications = null;
        vm.refresh = refresh;
        vm.remove = remove;
        vm.loadMore = loadMore;
        vm.details = details;
        vm.pickMedication = pickMedication;

        refresh();

        $ionicModal.fromTemplateUrl('templates/medications/medications.search.modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            vm.searchModal = modal
        });

        function pickMedication(medication) {
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

        function remove(medication) {
            $ionicLoading.show({
                template: 'Deleting…'
            });
            MedicationService.removeItem(medication).then(
                function (items) {
                    vm.medications = items;
                }
            ).finally($ionicLoading.hide);
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

        function details(medication) {
            MedicationService.setItem(medication);
            $state.go('app.medication.details', {id: medication.id})
        }
    }
})();


