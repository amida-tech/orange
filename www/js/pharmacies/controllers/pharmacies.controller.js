(function () {
    "use strict";

    angular
        .module('orange')
        .controller('PharmaciesCtrl', PharmaciesCtrl);

    PharmaciesCtrl.$inject = ['$scope', '$state', '$ionicLoading', '$cordovaDialogs', 'PharmacyService'];

    function PharmaciesCtrl($scope, $state, $ionicLoading, $cordovaDialogs, PharmacyService) {
        var vm = this;

        vm.refresh = refresh;
        vm.remove = remove;
        vm.loadMore = loadMore;
        vm.isInfinite = PharmacyService.isInfinite;
        vm.pharmacyDetails = pharmacyDetails;
        vm.pharmacies = null;

        refresh();

        function refresh() {
            vm.pharmaciesPromise = PharmacyService.getItems(true);
            vm.pharmaciesPromise.then(function (items) {
                vm.pharmacies = items;
                $scope.$broadcast('scroll.refreshComplete');
            });
        }

        function remove(pharmacy) {
            $ionicLoading.show({
                template: 'Deleting...'
            });
            PharmacyService.removeItem(pharmacy).then(function (items) {
                $ionicLoading.hide();
                vm.pharmacies = items;
            }, removeFailure);
        }

        function removeFailure(error) {
            $ionicLoading.hide();
            $cordovaDialogs.alert(error.statusText, 'Error', 'OK');
        }

        function loadMore() {
            var morePromise = PharmacyService.moreItems();
            if (vm.pharmacies !== null && morePromise) {
                morePromise.then(function (items) {
                    vm.pharmacies = items;
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        }

        function pharmacyDetails(pharmacy) {
            PharmacyService.setItem(pharmacy);
            $state.go('app.pharmacies.details', {id: pharmacy.id});
        }
    }
})();
