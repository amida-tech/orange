(function () {
    'use strict';

    angular
        .module('orange')
        .controller('NotesCtrl', NotesCtrl);

    NotesCtrl.$inject = ['$scope', '$state', '$ionicLoading', '$cordovaDialogs', 'NoteService'];

    /* @ngInject */
    function NotesCtrl($scope, $state, $ionicLoading, $cordovaDialogs, NoteService) {
        var vm = this;
        vm.refresh = refresh;
        vm.remove = remove;
        vm.loadMore = loadMore;
        vm.details = noteDetails;
        vm.notes = null;
        vm.hasMore = NoteService.hasMore;

        refresh();

        function remove(note) {
            $ionicLoading.show({
                template: 'Deleting...'
            });

            NoteService.removeItem(note).then(function (items) {
                $ionicLoading.hide();
                vm.notes = items;
            }, removeError);
        }

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
            vm.notesPromise = NoteService.getItems(true);
            vm.notesPromise.then(function (notes) {
                $scope.$broadcast('scroll.refreshComplete');
                vm.notes = notes;
            });
        }

        function loadMore() {
            var morePromise = NoteService.moreItems();
            if (vm.notes !== null && morePromise) {
                morePromise.then(function (items) {
                    vm.notes = items;
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        }

        function noteDetails(note) {
            NoteService.setItem(note);
            $state.go('app.notes.details', {id: note.id});
        }
    }
})();

