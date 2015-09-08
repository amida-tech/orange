(function () {
    'use strict';

    angular
        .module('orange')
        .controller('LogDetailsCtrl', LogDetailsCtrl);

    LogDetailsCtrl.$inject = ['$state', '$stateParams', '$ionicPopup', '$ionicLoading', 'PatientService'];

    function LogDetailsCtrl($state, $stateParams, $ionicPopup, $ionicLoading, PatientService) {

        var vm = this;

        vm.deleteLog = deleteLog;

        PatientService.getItem($stateParams['id']).then(function (patient) {
            vm.currentLog = patient;
            vm.title = vm.currentLog.fullName;
        });

        function deleteLog() {
            $ionicPopup.confirm({
                title: 'Delete Log',
                template: 'Are you sure want to delete this log?',
                okType: 'button-orange'
            }).then(
                function (confirm) {
                    if (confirm) {
                        var isCurrent = vm.currentLog.id === PatientService.currentPatient.id;
                        $ionicLoading.show({
                            template: 'Deleting...'
                        });
                        PatientService.removeItem(vm.currentLog).then(
                            function () {
                                $ionicLoading.hide();
                                $state.go('app.logs.list', {}, {reload: isCurrent});
                            },
                            function (error) {
                                $ionicLoading.hide();
                                $ionicPopup.alert({
                                    title: 'Error',
                                    template: error.data.errors
                                });
                            }
                        );
                    }
                }
            );
        }
    }
})();
