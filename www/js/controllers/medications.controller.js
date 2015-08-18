(function () {
    "use strict";
    angular
        .module('orange')
        .controller('MedicationsCtrl', MedicationsCtrl);

    MedicationsCtrl.$inject = ['$scope', '$ionicLoading', '$ionicModal', 'medications', 'log'];

    /* @ngInject */
    function MedicationsCtrl($scope, $ionicLoading, $ionicModal, medications, log) {
        var vm = this;
        var searchModal = null;

        vm.medications = null;
        vm.refresh = refresh;
        vm.remove = remove;
        vm.openModal = openModal;
        vm.closeModal = closeModal;

        medications.setLog(log);
        refresh(false);

        $ionicModal.fromTemplateUrl('templates/partial/medications.search.modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            searchModal = modal
        });

        function openModal() {
            searchModal.show();
        }

        function closeModal() {

            searchModal.hide();
        }

        $scope.$watch(medications.getMedications, function(medications) {
            if (medications !== vm.medications) {
                vm.medications = medications;
            }
        });

        ///////////////////////////////////

        function refresh(force) {
            force = force === undefined ? true : force;

            var method = force ? 'fetchAll' : 'getAll';

            medications[method]().then(
                function(medications) {
                    vm.medications = medications;
                    $scope.$broadcast('scroll.refreshComplete');
                },
                function(error) {
                    console.log(error);
                }
            )
        }

        function remove(medication) {
            $ionicLoading.show({
                template: 'Deleting…'
            });
            medications.remove(medication).then(
                undefined,
                function(error) {
                    console.log(error);
                }
            ).finally($ionicLoading.hide);
        }

    }
})();


