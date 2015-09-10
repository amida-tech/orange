(function () {
    'use strict';

    angular
        .module('orange')
        .controller('SharingCtrl', SharingCtrl);

    SharingCtrl.$inject = ['$scope', '$state', '$q', '$locale', '$ionicLoading', '$ionicPopup',
                           'PatientService', 'RequestsService', 'GlobalService'];

    function SharingCtrl($scope, $state, $q, $locale, $ionicLoading, $ionicPopup, PatientService,
                         RequestsService, GlobalService) {
        var vm = this;

        vm.months = $locale.DATETIME_FORMATS.MONTH;
        vm.accept = accept;
        vm.decline = decline;
        vm.cancel = cancel;
        vm.update = update;
        vm.log = null;
        vm.month = '0';

        PatientService.getItems().then(function (items) {
            vm.logs = items;
            vm.logList = _.chunk(items, 3);
            vm.log = vm.logs && vm.logs[0].id.toString();
            vm.month = (new Date()).getMonth().toString();
        });

        update();

        function update(force) {
            $q.all([
                RequestsService.getRequested(force),
                RequestsService.getRequests(force)
            ]).then(
                function (data) {
                    vm.requested = data[0];
                    vm.requests = data[1];
                    $scope.$broadcast('scroll.refreshComplete');
                }
            );
        }

        function decline(request) {
            $ionicPopup.confirm({
                title: 'Decline Request',
                template: 'Are you sure want decline this request?'
            }).then(function (confirm) {
                if (confirm) {
                    $ionicLoading.show({
                        template: 'Declining...'
                    });

                    RequestsService.declineRequest(request).then(
                        function () {
                            $ionicLoading.hide();
                            update();
                        },
                        failureCallback
                    );
                }
            });
        }

        function cancel(request) {
            $ionicPopup.confirm({
                title: 'Cancel Request',
                template: 'Are you sure want cancel this request?'
            }).then(function (confirm) {
                if (confirm) {
                    $ionicLoading.show({
                        template: 'Cancelling...'
                    });

                    RequestsService.cancelRequested(request).then(
                        function () {
                            $ionicLoading.hide();
                            update();
                        },
                        failureCallback
                    );
                }
            });
        }

        function accept(request) {
            RequestsService.setAcceptingRequest(request);
            $state.go('app.sharing-accept');
        }

        function failureCallback(error) {
            $ionicLoading.hide();
            if (error.data.errors[0] === $scope.ERROR_LIST.INVALID_REQUEST_ID) {
                GlobalService.showError('Request already cancelled or closed or not found').then(function () {
                    update(true);
                });
            } else if (error.data.errors[0] === $scope.ERROR_LIST.INVALID_STATUS) {
                GlobalService.showError('Invalid status').then(function () {
                    update(true);
                });
            }
        }
    }
})();
