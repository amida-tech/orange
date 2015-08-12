(function () {
    "use strict";

    angular
        .module('orange')
        .controller('PharmaciesCtrl', PharmaciesCtrl);

    PharmaciesCtrl.$inject = ['$scope', '$ionicLoading', 'log'];

    function PharmaciesCtrl($scope, $ionicLoading, log) {
        var vm = this;
        vm.pharmaciesPromise = $scope.pharmacies;
        vm.pharmacies = $scope.pharmacies.$object;
        vm.refresh = refresh;

        function refresh() {
            vm.pharmacies.getList().then(
                function (pharmacies) {
                    $scope.$broadcast('scroll.refreshComplete');
                    vm.pharmacies = pharmacies;
                }
            );
        }
    }
})();
