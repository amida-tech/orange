(function () {
    'use strict';

    angular
        .module('orange')
        .controller('NotesCtrl', NotesCtrl);

    NotesCtrl.$inject = ['$scope', '$ionicLoading', 'patient'];

    /* @ngInject */
    function NotesCtrl($scope, $ionicLoading, patient) {
        //OrangeApi.notes.
        var vm = this;
        vm.refresh = refresh;
        vm.shouldShowDelete = false;
        vm.notesPromise = $scope.notes;
        vm.notes = $scope.notes.$object;

        vm.removeNote = function(note) {
            $ionicLoading.show({
                template: 'Deleting...'
            });

            note.remove().then(function() {
                _.remove(vm.notes, function(elem) {
                    return elem.id == note.id;
                });
                $ionicLoading.hide();
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

        function refresh() {
            vm.notes.getList({sort_order: 'desc', sort_by: 'date'}).then(
                function(notes) {
                    $scope.$broadcast('scroll.refreshComplete');
                    vm.notes = notes;
                }
            )
        }
    }
})();

