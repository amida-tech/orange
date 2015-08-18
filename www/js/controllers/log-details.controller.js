(function () {
    'use strict';

    angular
        .module('orange')
        .controller('LogDetailsCtrl', LogDetailsCtrl);

    LogDetailsCtrl.$inject = ['$scope', '$state', '$stateParams', '$ionicPopup', '$ionicLoading',
                              'LogService'];

    function LogDetailsCtrl($scope, $state, $stateParams, $ionicPopup, $ionicLoading, LogService) {

        var vm = this;

        vm.deleteLog = deleteLog;

        vm.currentLog = LogService.setDetailLog($stateParams.id);
        vm.title = vm.currentLog.first_name + ' ' + vm.currentLog.last_name;

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
                        LogService.removeLog(vm.currentLog).then(
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
