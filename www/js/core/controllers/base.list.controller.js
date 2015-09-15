(function () {
    "use strict";

    angular
        .module('orange')
        .controller('BaseListController', BaseListController);

    BaseListController.$inject = ['$scope', '$state', '$ionicLoading', '$injector'];

    function BaseListController($scope, $state, $ionicLoading, $injector) {
        var vm = this;

        vm.items = null;
        vm.service = $injector.get($state.params['service']);
        vm.detailsState = null;
        vm.hasMore = this.service.hasMore;

        vm.refresh = refresh;
        vm.remove = remove;
        vm.loadMore = loadMore;
        vm.details = details;

        refresh();

        function refresh() {
            vm.itemsPromise = vm.service.getItems(true);
            vm.itemsPromise.then(function (items) {
                vm.items = items;
                $scope.$broadcast('scroll.refreshComplete');
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
