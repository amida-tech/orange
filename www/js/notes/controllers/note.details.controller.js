(function () {
    'use strict';

    angular
        .module('orange')
        .controller('NoteDetailsCtrl', NoteDetailsCtrl);

    NoteDetailsCtrl.$inject = ['$q', '$stateParams', 'NoteService', 'MedicationService'];

    function NoteDetailsCtrl($q, $stateParams, NoteService, MedicationService) {
        var vm = this;

        vm.title = 'Note Details';
        vm.notesPromise = NoteService.getItems();
        vm.medicationsPromise = MedicationService.getItems();
        $q.all([
            NoteService.getItem($stateParams['id']),
            vm.medicationsPromise
        ]).then(function (data) {
            vm.note = data[0];
            if (vm.note['medication_ids']) {
                vm.note.medications = _.map(vm.note.medication_ids, function (id) {
                    return _.filter(data[1], function (medication) {
                        return medication.id == id;
                    })[0]
                });
            }
        });
    }
})();
