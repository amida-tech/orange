(function () {
    'use strict';

    angular
        .module('orange')
        .controller('NoteAddCtrl', NoteAddCtrl);

    NoteAddCtrl.$inject = [
        '$q', '$scope', '$filter', '$state', '$stateParams',
        '$ionicLoading', '$ionicModal', 'NoteService', 'MedicationService', 'GlobalService'
    ];

    /* @ngInject */
    function NoteAddCtrl($q, $scope, $filter, $state, $stateParams,
                         $ionicLoading, $ionicModal, NoteService, MedicationService, GlobalService) {
        /* jshint validthis: true */
        var vm = this;
        //Check "id" param in url
        var is_edit = 'id' in $stateParams,
            backState = (is_edit) ? 'app.notes.details' : 'app.notes.list';

        vm.title = (is_edit) ? 'Edit Note' : 'Add Note';
        vm.notesPromise = NoteService.getItems();
        vm.medicationsPromise = MedicationService.getAllItems();

        //Medications to add model
        vm.medications = [];
        vm.errors = [];

        var id = $stateParams.id;
        $q.all([
            NoteService.getItem(id, true),
            vm.medicationsPromise
        ]).then(function (data) {
            vm.note = id && data[0] || {};
            vm.medications = _.map(data[1], function(medication) {
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

        vm.back = function () {
            GlobalService.showConfirm('All changes will discard. Continue?').then(
                function (confirm) {
                    if (confirm) {
                        $state.go(backState, {id: $stateParams.id});
                    }
                }
            );
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
            NoteService.setItem(null);
            $state.go('app.notes.list');
        }

        function saveError(error) {
            $ionicLoading.hide();
            if (error.data.errors[0] !== NoteService.errorItemNotFound) {
                vm.errors = _.map(error.data.errors, _.startCase);
            }
        }

        vm.showFull = false;
        vm.moreClick = function(medicationName) {
            vm.showFull = true;
        }
    }
})();
