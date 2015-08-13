(function () {
    "use strict";

    angular
        .module('orange')
        .controller('PharmaciesCtrl', PharmaciesCtrl);

    PharmaciesCtrl.$inject = ['$scope', '$ionicLoading', '$cordovaDialogs'];

    function PharmaciesCtrl($scope, $ionicLoading, $cordovaDialogs) {
        var vm = this;
        vm.pharmaciesPromise = $scope.pharmacies;
        vm.pharmacies = $scope.pharmacies.$object;
        vm.refresh = refresh;
        vm.remove = remove;

        function refresh() {
            vm.pharmacies.getList().then(
                function (pharmacies) {
                    $scope.$broadcast('scroll.refreshComplete');
                    vm.pharmacies = pharmacies;
                }
            );
        }

        function remove(pharmacy) {
            $ionicLoading.show({
                template: 'Deleting...'
            });
            pharmacy.remove().then(removeSuccess, removeFailure);
        }

        function removeSuccess(pharmacy) {
            $ionicLoading.hide();
            _.remove(vm.pharmacies, function (item) {
                return item.id == pharmacy.id;
            });
        }

        function removeFailure(error) {
            $ionicLoading.hide();
            $cordovaDialogs.alert(error.statusText, 'Error', 'OK');
        }
    }
})();
