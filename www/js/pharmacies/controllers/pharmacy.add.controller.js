(function () {
    'use strict';

    angular
        .module('orange')
        .controller('PharmacyAddCtrl', PharmacyAddCtrl);

    PharmacyAddCtrl.$inject = [
        '$scope', '$ionicLoading', '$cordovaDialogs', '$state', '$locale', '$ionicModal',
        '$stateParams', 'PharmacyService'
    ];

    function PharmacyAddCtrl($scope, $ionicLoading, $cordovaDialogs, $state, $locale,
                             $ionicModal, $stateParams, PharmacyService) {
        var vm = this,
            is_edit = 'id' in $stateParams;
        vm.title = ((is_edit) ? 'Edit': 'Add') + ' Pharmacy';
        vm.pharmacy = {hours: {}};
        vm.days = $locale.DATETIME_FORMATS.DAY;
        vm.save = save;

        $ionicModal.fromTemplateUrl('templates/pharmacies/hours.modal.html', {
            scope: $scope
        }).then(function (modal) {
            vm.hoursModal = modal;

        });

        if (is_edit) {
            vm.pharmacy = PharmacyService.getItem();
        } else {
            _.each(vm.days, function (day) {
                vm.pharmacy.hours[day.toLowerCase()] = {open: '09:00', close: '17:00'}
            });
        }

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
                PharmacyService.saveItem(vm.pharmacy).then(saveSuccess, saveError);
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
