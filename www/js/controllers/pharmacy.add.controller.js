(function () {
    'use strict';

    angular
        .module('orange')
        .controller('PharmacyAddCtrl', PharmacyAddCtrl);

    PharmacyAddCtrl.$inject = [
        '$scope', '$ionicLoading', 'log', '$cordovaDialogs', '$state'
    ];

    function PharmacyAddCtrl($scope, $ionicLoading, log, $cordovaDialogs, $state) {
        var vm = this;
        vm.title = 'Add Pharmacy';
        vm.pharmacy = {};
        vm.save = save;

        /**
         * Save pharmacy
         * @param form
         */
        function save(form) {
            form.$submitted = true;
            if (_.isEmpty(form.$error)) {
                $ionicLoading.show({
                    template: 'Saving...'
                });
                log.all('pharmacies').post(vm.pharmacy).then(saveSuccess, saveError);
            }
        }

        function saveSuccess(pharmacy) {
            $ionicLoading.hide();
            $scope.pharmacies.$object.unshift(pharmacy);
            $state.go('app.pharmacies.list');
        }

        function saveError(error) {
            $ionicLoading.hide();
            $cordovaDialogs.alert(error.statusText, 'Error', 'OK');
        }
    }
})();
