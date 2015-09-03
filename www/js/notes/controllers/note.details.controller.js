(function () {
    'use strict';

    angular
        .module('orange')
        .controller('NoteDetailsCtrl', NoteDetailsCtrl);

    NoteDetailsCtrl.$inject = ['NoteService', 'MedicationService'];

    function NoteDetailsCtrl(NoteService, MedicationService) {
        var vm = this;

        vm.title = 'Note Details';
        vm.notesPromise = NoteService.getItems();
        vm.medicationsPromise = MedicationService.getItems();
        vm.note = NoteService.getItem();

        vm.medicationsPromise.then(function (medications) {
            vm.note.medications = _.map(vm.note.medication_ids, function(id) {
                return _.filter(medications, function(medication) {
                    return medication.id == id;
                })[0]
            });
        });
    }
})();
