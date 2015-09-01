(function () {
    'use strict';

    angular
        .module('orange')
        .controller('PharmacyDetailsCtrl', PharmacyDetailsCtrl);

    PharmacyDetailsCtrl.$inject = ['$scope', '$locale', 'PharmacyService'];

    function PharmacyDetailsCtrl($scope, $locale, PharmacyService) {
        var vm = this;

        vm.pharmacyPromise = PharmacyService.getItems();
        vm.days = $locale.DATETIME_FORMATS.DAY;
        vm.pharmacy = PharmacyService.getItem();

    }
})();
