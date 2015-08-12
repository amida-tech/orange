(function () {
    'use strict';

    angular
        .module('orange')
        .controller('PharmacyAddCtrl', PharmacyAddCtrl);

    PharmacyAddCtrl.$inject = [
        '$scope', '$ionicLoading', 'log', '$cordovaDialogs', '$state', '$locale', '$ionicModal'
    ];

    function PharmacyAddCtrl($scope, $ionicLoading, log, $cordovaDialogs, $state, $locale, $ionicModal) {
        var vm = this;
        vm.title = 'Add Pharmacy';
        vm.pharmacy = {};
        vm.days = $locale.DATETIME_FORMATS.DAY;
        vm.save = save;

        $ionicModal.fromTemplateUrl('templates/partial/hours.modal.html', {
            scope: $scope,
            anumation: 'slide-in-up'
        }).then(function (modal) {
            vm.hoursModal = modal;

        });

        /**
         * Save pharmacy
         * @param form
         */
        function save(form) {
            form.$submitted = true;
            console.log(vm.pharmacy);
            if (_.isEmpty(form.$error)) {
                $ionicLoading.show({
                    template: 'Saving...'
                });
                log.all('pharmacies').post(vm.pharmacy).then(saveSuccess, saveError);
            }
        }

        function saveSuccess() {
            $ionicLoading.hide();
            $state.go('app.pharmacies.list');
        }

        function saveError(error) {
            $ionicLoading.hide();
            $cordovaDialogs.alert(error.statusText, 'Error', 'OK');
        }
    }
})();
