(function () {
    'use strict';

    angular
        .module('orange')
        .controller('LogDetailsCtrl', LogDetailsCtrl);

    LogDetailsCtrl.$inject = ['$state', '$stateParams', '$ionicLoading', 'PatientService', 'GlobalService'];

    function LogDetailsCtrl($state, $stateParams, $ionicLoading, PatientService, GlobalService) {

        var vm = this;

        vm.deleteLog = deleteLog;

        PatientService.getItem($stateParams['id']).then(function (patient) {
            vm.currentLog = patient;
            vm.title = vm.currentLog.fullName;
        });

        function deleteLog() {
            GlobalService.showConfirm('Are you sure want to delete this log?', 'Delete Log').then(
                function (confirm) {
                    if (confirm) {
                        var isCurrent = vm.currentLog.id === PatientService.currentPatient.id;
                        $ionicLoading.show({
                            template: 'Deleting...'
                        });
                        PatientService.removeItem(vm.currentLog).then(
                            function (response) {
                                if (!response.length) {
                                    $state.go('logs');
                                    return;
                                }
                                $ionicLoading.hide();
                                $state.go('app.logs.list', {}, {reload: isCurrent});
                            },
                            function (error) {
                                $ionicLoading.hide();
                                GlobalService.showError(_.startCase(error.data.errors[0]));
                            }
                        );
                    }
                }
            );
        }
    }
})();
