(function () {
    'use strict';

    angular
        .module('orange')
        .controller('NoteAddCtrl', NoteAddCtrl);

    NoteAddCtrl.$inject = [
        '$scope', '$filter', '$state', '$stateParams',
        '$ionicLoading', '$ionicModal', '$cordovaDialogs', 'NoteService', 'MedicationService'
    ];

    /* @ngInject */
    function NoteAddCtrl($scope, $filter, $state, $stateParams,
                         $ionicLoading, $ionicModal, $cordovaDialogs,  NoteService, MedicationService) {
        /* jshint validthis: true */
        var vm = this;
        //Check "id" param in url
        var is_edit = 'id' in $stateParams;
        if (is_edit) {
            var id = $stateParams.id;
        }

        vm.title = (is_edit) ? 'Edit Note' : 'Add Note';
        vm.backState = (is_edit) ? 'app.notes.details({id: '+id+'})' : 'app.notes.list';
        vm.note = NoteService.getItem() || {};
        vm.notesPromise = NoteService.getItems();
        vm.medicationsPromise = MedicationService.getItems();

        //Medications to add model
        vm.medications = [];

        vm.medicationsPromise.then(function (medications) {

            vm.medications = _.map(medications, function(medication) {
                medication.checked = false;

                if (is_edit) {
                    var has_medication = _.find(vm.note.medications, function(med) {
                       return med.id == medication.id
                    });

                    medication.checked = !_.isUndefined(has_medication);
                    return medication
                }

                return medication
            });
        });

        //Save note
        vm.save = function (form) {
            form.$submitted = true;
            if (!_.isEmpty(form.$error)) {
                return;
            }

            $ionicLoading.show({
                template: 'Saving...'
            });

            if (!is_edit) {
                vm.note.date = $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ssZ');
            }
            NoteService.saveItem(vm.note).then(saveSuccess, saveError);
        };

        //Medications List
        vm.medicationShowDelete = false;

        vm.onMedicationRemove = function(item) {
            item.checked = false;
            vm.note.medication_ids = _.compact(_.map(vm.medications, function(medication) {
                if (medication.checked)
                    return medication.id
            }));
        };

        //Medication Modal
        $ionicModal.fromTemplateUrl('templates/medications/medication.list.modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            vm.modal = modal;
        });

        //Set medications to note
        vm.medicationChangeEvent = function() {
            vm.note.medication_ids = _.compact(_.map(vm.medications, function(medication) {
                if (medication.checked)
                    return medication.id
            }));
        };

        function saveSuccess(note) {
            $ionicLoading.hide();
            $state.go('app.notes.list');
        }

        function saveError(error) {
            $ionicLoading.hide();

            if (error.status == 400) {
                $cordovaDialogs.alert('Bad Request', 'Error', 'OK');
            }

            if (error.status == 401) {
                $cordovaDialogs.alert('Unauthorized', 'Error', 'OK');
            }
        }
    }
})();
