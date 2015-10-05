(function () {
    'use strict';

    angular
        .module('orange')
        .controller('PharmacyAddCtrl', PharmacyAddCtrl);

    PharmacyAddCtrl.$inject = [
        '$scope', '$ionicLoading', '$state', '$locale', '$ionicModal',
        '$stateParams', 'PharmacyService'
    ];

    function PharmacyAddCtrl($scope, $ionicLoading, $state, $locale,
                             $ionicModal, $stateParams, PharmacyService) {
        var vm = this,
            is_edit = 'id' in $stateParams;
        vm.title = ((is_edit) ? 'Edit': 'Add') + ' Pharmacy';
        vm.days = $locale.DATETIME_FORMATS.DAY;
        vm.save = save;
        vm.applyHoursToAll = applyHoursToAll;
        vm.errors = [];
        vm.backState = 'app.pharmacies.' + (is_edit ? 'details({id: ' + $stateParams.id +'})' : 'list');

        $ionicModal.fromTemplateUrl('templates/pharmacies/hours.modal.html', {
            scope: $scope
        }).then(function (modal) {
            vm.hoursModal = modal;

        });

        if (is_edit) {
            PharmacyService.getItem($stateParams.id, true).then(function (pharmacy) {
                vm.pharmacy = pharmacy;
            });
        } else {
            vm.pharmacy = {hours: {}};
            _.each(vm.days, function (day) {
                vm.pharmacy.hours[day.toLowerCase()] = {open: '09:00 am', close: '05:00 pm'}
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
            PharmacyService.setItem(null);
            $state.go('app.pharmacies.list');
        }

        function saveError(error) {
            $ionicLoading.hide();
            if (error.data.errors[0] !== PharmacyService.errorItemNotFound) {
                vm.errors = _.map(error.data.errors, _.startCase);
            }
        }

        function applyHoursToAll(month) {
            _.each(vm.pharmacy.hours, function (hours, _month) {
                if (month !== _month) {
                    hours['open'] = vm.pharmacy.hours[month]['open'];
                    hours['close'] = vm.pharmacy.hours[month]['close'];
                }
            });
        }
    }
})();
