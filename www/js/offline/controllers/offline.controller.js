(function () {
    "use strict";

    angular
        .module('orange')
        .controller('OfflineController', OfflineController);

    OfflineController.$inject = ['$state', '$rootScope', '$ionicLoading', '$ionicHistory', 'OrangeApi', 'OfflineService', 'GlobalService', 'Auth'];

    /* @ngInject */
    function OfflineController($state, $rootScope, $ionicLoading, $ionicHistory, OrangeApi, OfflineService, GlobalService, Auth) {
        /* jshint validthis: true */
        var vm = this;

        vm.tryOnline = tryOnline;
        vm.medications = parseMedications(OfflineService.getItems('medications'));
        vm.notes = OfflineService.getItems('notes');
        vm.doctors = OfflineService.getItems('doctors');
        vm.pharmacies = OfflineService.getItems('pharmacies');

        angular.element(document.querySelector('.modal-backdrop.active')).remove();
        angular.element(document.querySelector('body')).removeClass('modal-open');

        //////////////////

        function parseMedications(medications) {
            var meds = {};
            meds.active = _.filter(medications, function(med) {
                return med.status == 'active'
            });

            meds.paused = _.filter(medications, function(med) {
                return med.status == 'paused'
            });

            meds.archived = _.filter(medications, function(med) {
                return med.status == 'archived'
            });

            return meds;
        }

        function tryOnline() {
            console.log('Trying go online');
            $ionicLoading.show({
                template: 'Checking...'
            });
            OrangeApi.auth.all('token').options().then(
                function (response) {
                    $ionicHistory.nextViewOptions({
                        disableBack: true,
                        historyRoot: true
                    });
                    if (Auth.isAuthorized()) {
                        $state.go('app.today.schedule');
                    } else {
                        $rootScope.initAuth();
                    }


                    //$state.go('onboarding');
                    //GlobalService.showError('No internet connection');
                },
                function (error) {
                    GlobalService.showError('No internet connection');
                }
            ).finally(function() {
                $ionicLoading.hide();
            });
        }

    }
})();