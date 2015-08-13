(function () {
    'use strict';

    angular
        .module('orange')
        .controller('PharmacyAddCtrl', PharmacyAddCtrl);

    PharmacyAddCtrl.$inject = [
        '$scope', '$ionicLoading', 'log', '$cordovaDialogs', '$state', '$locale', '$ionicModal',
        '$stateParams'
    ];

    function PharmacyAddCtrl($scope, $ionicLoading, log, $cordovaDialogs, $state, $locale,
                             $ionicModal, $stateParams) {
        var vm = this,
            is_edit = 'id' in $stateParams;
        vm.title = ((is_edit) ? 'Edit': 'Add') + ' Pharmacy';
        vm.pharmacy = {};
        vm.days = $locale.DATETIME_FORMATS.DAY;
        vm.save = save;

        $ionicModal.fromTemplateUrl('templates/partial/hours.modal.html', {
            scope: $scope
        }).then(function (modal) {
            vm.hoursModal = modal;

        });

        if (is_edit) {
            vm.pharmacy = _.find($scope.pharmacies.$object, function (item) {
                return item.id == $stateParams.id;
            });
        }

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
                if (is_edit) {
                    vm.pharmacy.save().then(saveSuccess, saveError);
                } else {
                    log.all('pharmacies').post(vm.pharmacy).then(saveSuccess, saveError);
                }
            }
        }

        function saveSuccess(pharmacy) {
            $ionicLoading.hide();
            if (!is_edit) {
                $scope.pharmacies.$object.push(pharmacy);
            }
            $state.go('app.pharmacies.list');
        }

        function saveError(error) {
            $ionicLoading.hide();
            $cordovaDialogs.alert(error.statusText, 'Error', 'OK');
        }
    }
})();
