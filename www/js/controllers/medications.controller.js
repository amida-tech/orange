(function () {
    "use strict";
    angular
        .module('orange')
        .controller('MedicationsCtrl', MedicationsCtrl);

    MedicationsCtrl.$inject = ['$scope', '$ionicLoading', 'medications', 'patient'];

    /* @ngInject */
    function MedicationsCtrl($scope, $ionicLoading, medications, patient) {
        var vm = this;

        vm.medications = null;

        vm.refresh = refresh;
        vm.remove = remove;

        medications.setLog(patient);


        refresh(false);

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
            ).finally(
                function() {
                    $ionicLoading.hide();
                }
            )
        }

    }
})();


