(function () {
    'use strict';

    angular
        .module('orange')
        .controller('PharmacyDetailsCtrl', PharmacyDetailsCtrl);

    PharmacyDetailsCtrl.$inject = ['$stateParams', '$cordovaInAppBrowser', '$locale', 'PharmacyService'];

    function PharmacyDetailsCtrl($stateParams, $cordovaInAppBrowser, $locale, PharmacyService) {
        var vm = this;

        vm.pharmacyPromise = PharmacyService.getItems().then(
            function () {
                PharmacyService.getItem($stateParams['id']).then(function (pharmacy) {
                    vm.pharmacy = pharmacy;
                });
            }
        );
        vm.days = $locale.DATETIME_FORMATS.DAY;

        vm.toMap = function () {
            $cordovaInAppBrowser.open('http://maps.apple.com/?q=' + vm.pharmacy.address.replace(' ', '+'), '_system');
        }
    }
})();
