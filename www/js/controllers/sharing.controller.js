(function () {
    'use strict';

    angular
        .module('orange')
        .controller('SharingCtrl', SharingCtrl);

    SharingCtrl.$inject = ['$scope', '$state', '$q', '$locale', '$ionicLoading', '$ionicPopup',
                           'LogService', 'RequestsService'];

    function SharingCtrl($scope, $state, $q, $locale, $ionicLoading, $ionicPopup, LogService, RequestsService) {
        var vm = this;

        vm.months = $locale.DATETIME_FORMATS.MONTH;
        vm.accept = accept;
        vm.decline = decline;
        vm.cancel = cancel;
        vm.update = update;
        vm.log = null;

        LogService.getLogs().then(function (items) {
            vm.logs = items;
            vm.logList = _.chunk(items, 3);
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
                },
                function (error) {
                    showError(error);
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
                        function (error) {
                            $ionicLoading.hide();
                            showError(error);
                        }
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
                        function (error) {
                            $ionicLoading.hide();
                            showError(error);
                        }
                    );
                }
            });
        }

        function accept(request) {
            RequestsService.setAcceptingRequest(request);
            $state.go('app.sharing-accept');
        }

        function showError(error) {
            $ionicPopup.alert({
                title: 'Error',
                template: error.data.errors
            });
        }
    }
})();
