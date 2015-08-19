(function () {
    'use strict';

    angular
        .module('orange')
        .controller('NoteAddCtrl', NoteAddCtrl);

    NoteAddCtrl.$inject = [
        '$scope', '$filter', '$state', '$stateParams',
        '$ionicLoading', '$ionicModal', '$cordovaDialogs',  'patient'
    ];

    /* @ngInject */
    function NoteAddCtrl($scope, $filter, $state, $stateParams,
                         $ionicLoading, $ionicModal, $cordovaDialogs,  patient) {
        /* jshint validthis: true */
        var vm = this;
        //Check "id" param in url
        var is_edit = 'id' in $stateParams;
        if (is_edit) {
            var id = $stateParams.id;
        }

        vm.title = (is_edit) ? 'Edit Note' : 'Add Note';
        vm.backState = (is_edit) ? 'app.notes.details({id: '+id+'})' : 'app.notes.list';
        vm.note = {} ;
        vm.notesPromise = $scope.notes;
        vm.medicationsPromise = $scope.medications;

        //Medications to add model
        vm.medications = [];

        //Init data
        $scope.$watchGroup(['notes.$$state.status', 'medications.$$state.status'], function(newValues, oldValues, group) {
            if (newValues[0] && newValues[1]) {
                setData($scope.notes.$object, $scope.medications.$object)
            }
        });

        if ($scope.notes.$$state.status && $scope.medications.$$state.status) {
            if (is_edit) {
                setData($scope.notes.$object, $scope.medications.$object)
            }
        }

        function setData(notes, medications) {
            if (is_edit)
                setNote(notes, medications);

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

        }

        function setNote(notes, medications) {
            var note = _.find(notes, function(nt) {
                return nt.id == id;
            });

            note.medications = _.map(note.medication_ids, function(id) {
                return _.find(medications, function(medication) {
                    return medication.id == id;
                })
            });

            vm.note = note;
        }

        //Save note
        vm.save = function (form) {
            form.$submitted = true;
            if (!_.isEmpty(form.$error)) {
                return;
            }

            $ionicLoading.show({
                template: 'Saving...'
            });

            if (is_edit) {
                vm.note.save().then(updateSuccess, saveError);
            } else {
                vm.note.date = $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ssZ');
                patient.all('journal').post(vm.note).then(saveSuccess, saveError);
            }
        };

        //Medications List
        vm.medicationShowDelete = false;

        vm.onMedicationRemove = function(item) {
            item.checked = false;
        };

        //Medication Modal
        $ionicModal.fromTemplateUrl('templates/partial/medication.list.modal.html', {
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
            $scope.notes.$object.unshift(note);
            $state.go('app.notes.list');
        }

        function updateSuccess(note) {
            $ionicLoading.hide();
            _.each($scope.notes.$object, function(nt, i) {
                if (nt.id != note.id) {
                    return;
                }

                $scope.notes.$object[i] = note;
            });
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
