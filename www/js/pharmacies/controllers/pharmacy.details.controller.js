(function () {
    'use strict';

    angular
        .module('orange')
        .controller('PharmacyDetailsCtrl', PharmacyDetailsCtrl);

    PharmacyDetailsCtrl.$inject = ['$stateParams', '$locale', 'PharmacyService'];

    function PharmacyDetailsCtrl($stateParams, $locale, PharmacyService) {
        var vm = this;

        vm.pharmacyPromise = PharmacyService.getItems();
        vm.days = $locale.DATETIME_FORMATS.DAY;
        PharmacyService.getItem($stateParams['id']).then(function (pharmacy) {
            vm.pharmacy = pharmacy;
        });

    }
})();
