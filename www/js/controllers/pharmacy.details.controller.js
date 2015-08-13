(function () {
    'use strict';

    angular
        .module('orange')
        .controller('PharmacyDetailsCtrl', PharmacyDetailsCtrl);

    PharmacyDetailsCtrl.$inject = [
        '$scope', '$stateParams', '$locale'
    ];

    function PharmacyDetailsCtrl($scope, $stateParams, $locale) {
        var vm = this;

        vm.pharmacyPromise = $scope.pharmacies;
        vm.days = $locale.DATETIME_FORMATS.DAY;
        vm.pharmacy = getPharmacy($stateParams.id);

        /* For refresh details page */
        $scope.$watch('pharmacies.$$state.status', function (newValue, oldValue) {
            if (newValue) {
                vm.pharmacy = getPharmacy($stateParams.id);
            }
        });

        /**
         * Return pharmacy by id
         */
        function getPharmacy(pharmacyId) {
            return _.find($scope.pharmacies.$object, function (item) {
                return item.id == pharmacyId;
            });
        }
    }
})();
