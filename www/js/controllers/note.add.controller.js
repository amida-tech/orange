(function () {
    'use strict';

    angular
        .module('orange')
        .controller('NoteAddCtrl', NoteAddCtrl);

    NoteAddCtrl.$inject = [
        '$scope', '$state', '$ionicLoading', 'log', '$ionicModal',
        'medications', '$filter', '$cordovaDialogs', 'note'
    ];

    /* @ngInject */
    function NoteAddCtrl($scope, $state, $ionicLoading, log,
                         $ionicModal, medications, $filter, $cordovaDialogs, note) {
        /* jshint validthis: true */
        var vm = this;
        vm.title = 'Add Note';
        vm.note = note.restangularized ? note : {} ;
        vm.save = save;
        vm.medications = medications;
        //Medications to add model
        vm.medicationsAdd = _.map(vm.medications, function(medication) {
            medication.checked = false;
            return medication
        });

        //Medications List
        vm.medicationWidgetData = {
            showDelete: false
        };

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
            vm.note.medication_ids = _.compact(_.map(vm.medicationsAdd, function(medication) {
                if (medication.checked)
                    return medication.id
            }));
        };

        function save(form) {
            form.$submitted = true;

            if (_.isEmpty(form.$error)) {
                vm.note.date = $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ssZ');
                $ionicLoading.show({
                    template: 'Saving...'
                });

                log.all('journal').post(vm.note).then(saveSuccess, saveError);
            }
        }

        function saveSuccess(note) {
            vm.note = note;
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
