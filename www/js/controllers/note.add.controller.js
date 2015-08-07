(function () {
    'use strict';

    angular
        .module('orange')
        .controller('NoteAddCtrl', NoteAddCtrl);

    NoteAddCtrl.$inject = ['$scope', '$state', '$ionicLoading', 'log', '$ionicModal', 'medications'];

    /* @ngInject */
    function NoteAddCtrl($scope, $state, $ionicLoading, log, $ionicModal, medications) {
        /* jshint validthis: true */
        var vm = this;
        vm.title = 'Add Note';
        vm.save = save;
        vm.medications = log.all('medications').getList();
        vm.medications = medications;
        vm.medicationsAdd = _.map(vm.medications, function(medication) {
            medication.checked = false;
            return medication
        });

        //Medications List
        vm.medicationWidgetData = {
            showDelete: false
        };
        vm.moveMedication = function(item, fromIndex, toIndex) {
            vm.medicationsAdd.splice(fromIndex, 1);
            vm.medicationsAdd.splice(toIndex, 0, item);
        };

        vm.onMedicationRemove = function(item) {
            item.checked = false;
        };

        //Medication Modal
        $ionicModal.fromTemplateUrl('templates/elements/medication.list.modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            vm.modal = modal;
        });

        vm.medicationChangeEvent = function(checked) {
            console.log(vm);
            return checked
        };

        function save() {
            $ionicLoading.show({
                template: 'Saving...'
            });
            log.all('note').post(vm.note).then(saveSuccess, saveError);
        }

        function saveSuccess(note) {
            vm.note = note;
            $ionicLoading.hide();
            $state.go('app.notes.list');
        }

        function saveError(error) {
            alert(error);
            $ionicLoading.hide();
        }
    }
})();
