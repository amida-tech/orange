(function () {
    "use strict";

    angular
        .module('orange')
        .controller('MedicationCtrl', MedicationCtrl);

    MedicationCtrl.$inject = ['$scope', '$state', '$stateParams', '$ionicLoading', 'medications', 'log'];

    /* @ngInject */
    function MedicationCtrl($scope, $state, $stateParams, $ionicLoading, medications, log) {
        /* jshint validthis: true */
        var vm = this;
        var id = $stateParams.id;

        vm.title = 'Medication Detail';
        vm.medication = null;
        vm.getEventText = medications.getEventText;
        vm.remove = remove;


        medications.setLog(log);

        activate();
        $scope.$watch(medications.getMedication, function (medication) {
            if (medication !== vm.medication) {
                vm.medication = medication;
            }
        });

        ////////////////

        function activate() {
            medications.get(id);
        }

        function remove() {
            $ionicLoading.show({
                template: 'Deleting…'
            });


            medications.remove(vm.medication).then(
                undefined,
                function (error) {
                    console.log(error);
                }
            ).finally(
                function () {
                    $ionicLoading.hide();
                    $state.go('app.medications.list');
                })
        }

    }
})();
