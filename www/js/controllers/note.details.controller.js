(function () {
    'use strict';

    angular
        .module('orange')
        .controller('NoteDetailsCtrl', NoteDetailsCtrl);

    NoteDetailsCtrl.$inject = [
        '$scope', '$stateParams', '$state'
    ];

    /* @ngInject */
    function NoteDetailsCtrl($scope, $stateParams, $state) {
        /* jshint validthis: true */
        var vm = this;
        var id = $stateParams.id;
        var medications = $scope.medications.$object;

        vm.title = 'Note Details';
        vm.notesPromise = $scope.notes;
        vm.medicationsPromise = $scope.medications;
        vm.note = {};

        //TODO: Refactoring data initialization
        $scope.$watchGroup(['notes.$$state.status', 'medications.$$state.status'], function(newValues, oldValues, group) {
            if (newValues[0] && newValues[1]) {
                setNote($scope.notes.$object, $scope.medications.$object)
            }
        });

        if ($scope.notes.$$state.status && $scope.medications.$$state.status) {
            setNote($scope.notes.$object, $scope.medications.$object)
        }


        function setNote(notes, medications) {
            var note = _.find(notes, function(nt) {
                return nt.id == id;
            });

            note.medications = _.map(note.medication_ids, function(id) {
                return _.filter(medications, function(medication) {
                    return medication.id == id;
                })[0]
            });

            vm.note = note;
        }
    }
})();
