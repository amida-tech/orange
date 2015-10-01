(function () {
    "use strict";

    angular
        .module('orange')
        .controller('NotesListController', NotesListController);

    NotesListController.$inject = ['$scope', '$state', '$ionicLoading', '$ionicModal', '$injector', 'MedicationService'];

    function NotesListController($scope, $state, $ionicLoading, $ionicModal, $injector, MedicationService) {
        var vm = this;

        vm.items = null;
        vm.service = $injector.get($state.params['service']);
        vm.detailsState = null;
        vm.hasMore = this.service.hasMore;

        vm.refresh = refresh;
        vm.remove = remove;
        vm.loadMore = loadMore;
        vm.details = details;
        vm.selectMedication = selectMedication;
        vm.selectFilter = selectFilter;
        vm.filter = null;
        vm.items = null;
        vm.filteredItems = null;


        console.log('NotesListController activated');

        refresh();

        $ionicModal.fromTemplateUrl('templates/notes/filter.modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            vm.modal = modal;
        });

        function selectMedication() {
            if (vm.filter) {
                vm.filter = null;
                applyFilter();
            } else {
                vm.modal.show();
            }

        }

        function selectFilter(medication) {

            vm.filter = {
                medication: medication
            };
            vm.modal.hide();
            applyFilter();
        }

        function applyFilter() {
            if (vm.filter) {
                var id = vm.filter.medication.id;
                vm.filteredItems = _.filter(vm.items, function(item) {
                    return item.medication_ids.indexOf(id) >= 0;
                })
            } else {
                vm.filteredItems = vm.items;
            }
        }


        function refresh() {
            vm.itemsPromise = vm.service.getItems(true);
            vm.itemsPromise.then(function (items) {
                MedicationService.getAllItems().then(function (medications) {
                    vm.medications = medications;
                    vm.items = items;
                    applyFilter();
                    $scope.$broadcast('scroll.refreshComplete');
                });

            });
        }

        function remove(item) {
            $ionicLoading.show({
                template: 'Deleting...'
            });
            vm.service.removeItem(item).then(function (items) {
                $ionicLoading.hide();
                vm.items = items;
            }, removeFailure);
        }

        function removeFailure(error) {
            $ionicLoading.hide();
        }

        function loadMore() {
            var morePromise = vm.service.moreItems();
            if (vm.items !== null && morePromise) {
                morePromise.then(function (items) {
                    vm.items = items;
                    applyFilter();
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        }

        function details(item) {
            vm.service.setItem(item);
            $state.go($state.params['detailsState'], {id: item.id});
        }
    }
})();
