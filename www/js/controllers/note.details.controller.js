(function () {
    'use strict';

    angular
        .module('orange')
        .controller('NoteDetailsCtrl', NoteDetailsCtrl);

    NoteDetailsCtrl.$inject = [
        '$scope', '$state', '$ionicLoading', 'note'
    ];

    /* @ngInject */
    function NoteDetailsCtrl($scope, $state, $ionicLoading, note) {
        /* jshint validthis: true */
        var vm = this;
        vm.title = 'Note Details';
        vm.note = note;

        vm.removeNote = function(note) {
            $ionicLoading.show({
                template: 'Deleting...'
            });

            vm.note.remove().then(function() {
                $ionicLoading.hide();
                $state.go('app.notes.list');
            }, removeError);
        };

        function removeError (error) {
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
