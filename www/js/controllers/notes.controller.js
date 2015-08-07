(function () {
    'use strict';

    angular
        .module('orange')
        .controller('NotesCtrl', NotesCtrl);

    NotesCtrl.$inject = ['$scope', '$ionicLoading', 'notes'];

    /* @ngInject */
    function NotesCtrl($scope, $ionicLoading, notes) {
        //OrangeApi.notes.
        var vm = this;

        vm.notes = notes;
        vm.note = {};
        vm.remove = remove;
        vm.refresh = refresh;

        function remove(note) {
            $ionicLoading.show({
                template: 'Deleting...'
            });
            note.remove().then(function() {
                _.remove(vm.notes, function(elem) {
                    return elem.id == note.id;
                });
                $ionicLoading.hide();
            });
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

