(function () {
    "use strict";

    angular
        .module('orange')
        .controller('MedicationCtrl', MedicationCtrl);

    MedicationCtrl.$inject = ['$scope', '$state', '$stateParams', '$ionicLoading', 'medications', 'patient'];

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
        medications.get(id);

        $scope.$watch(medications.getMedication, function (medication) {

            if (medication !== vm.medication) {
                console.log('Medication changed', medication);
                vm.medication = medication;
                vm.eventsText = getMedicationText(medication);
            }
        });

        ////////////////

        function getMedicationText(medication) {
            var text = '';
            if (medication && medication.schedule.times && medication.schedule.times.length) {
                var eventsCount = medication.schedule.times.length;
                text += eventsCount;
                text += ' event' + (eventsCount > 1 ? 's' : '') + ' per day'
            }

            return text;
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
                    $state.go('app.medications');
                })
        }

    }
})();
