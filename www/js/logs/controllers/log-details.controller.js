(function () {
    'use strict';

    angular
        .module('orange')
        .controller('LogDetailsCtrl', LogDetailsCtrl);

    LogDetailsCtrl.$inject = ['$state', '$ionicPopup', '$ionicLoading', 'PatientService'];

    function LogDetailsCtrl($state, $ionicPopup, $ionicLoading, PatientService) {

        var vm = this;

        vm.deleteLog = deleteLog;

        vm.currentLog = PatientService.getItem();
        vm.title = vm.currentLog.fullName;

        function deleteLog() {
            $ionicPopup.confirm({
                title: 'Delete Log',
                template: 'Are you sure want to delete this log?',
                okType: 'button-orange'
            }).then(
                function (confirm) {
                    if (confirm) {
                        $ionicLoading.show({
                            template: 'Deleting...'
                        });
                        PatientService.removeItem(vm.currentLog).then(
                            function () {
                                $ionicLoading.hide();
                                $state.go('app.logs.list');
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
