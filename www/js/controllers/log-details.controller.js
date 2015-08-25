(function () {
    'use strict';

    angular
        .module('orange')
        .controller('LogDetailsCtrl', LogDetailsCtrl);

    LogDetailsCtrl.$inject = ['$scope', '$state', '$stateParams', '$ionicPopup', '$ionicLoading',
                              '$cordovaActionSheet', 'LogService'];

    function LogDetailsCtrl($scope, $state, $stateParams, $ionicPopup, $ionicLoading, $cordovaActionSheet,
                            LogService) {

        var vm = this;

        vm.deleteLog = deleteLog;
        vm.call = call;

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

        function call() {
            $cordovaActionSheet.show({
                title: 'Select call method',
                buttonLabels: ['Phone', 'SMS'],
                addCancelButtonWithLabel: 'Cancel',
                androidEnableCancelButton: true
            }).then(function (index) {
                var phone = vm.currentLog.phone.match(/[\d\+]*/g).join('');
                if (phone[0] !== '+') {
                    phone = '+1' + phone;
                }
                switch (index) {
                    case 1:
                        document.location.href = 'tel:' + phone;
                        break;
                    case 2:
                        window.plugins.socialsharing.shareViaSMS('', phone).then(
                            function (success) {
                                console.log('Success SMS: ' + success);
                            },
                            function (error) {
                                console.log('Error SMS: ' + error);
                            }
                        );
                        break;
                }
            });
        }
    }
})();
