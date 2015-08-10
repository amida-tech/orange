(function () {
    'use strict';

    angular
        .module('orange')
        .controller('NotesCtrl', NotesCtrl);

    NotesCtrl.$inject = ['$scope', '$ionicLoading', 'log'];

    /* @ngInject */
    function NotesCtrl($scope, $ionicLoading, log) {
        //OrangeApi.notes.
        var vm = this;

        $ionicLoading.show({
            template: 'Loading...'
        });

        log.all('journal').getList().then(function(notes) {
            vm.notes = notes;
            $ionicLoading.hide()
        });

        vm.refresh = refresh;
        vm.shouldShowDelete = false;
        vm.noteLimit = 208;

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
            vm.notes.getList().then(
                function(notes) {
                    $scope.$broadcast('scroll.refreshComplete');
                    vm.notes = notes;
                }
            )
        }
    }
})();

