(function () {
    "use strict";

    angular
        .module('orange')
        .controller('PharmaciesCtrl', PharmaciesCtrl);

    PharmaciesCtrl.$inject = ['$scope', '$ionicLoading', 'pharmacies'];

    function PharmaciesCtrl($scope, $ionicLoading, pharmacies) {
        var vm = this;
        vm.pharmacies = pharmacies;
    }
})();
