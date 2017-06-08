(function () {
    'use strict';

    angular
        .module('orange')
        .controller('SharingCtrl', SharingCtrl);

    SharingCtrl.$inject = ['$scope', '$state', '$q', '$ionicLoading', '$ionicPopup',
                           'PatientService', 'RequestsService', 'GlobalService'];

    function SharingCtrl($scope, $state, $q, $ionicLoading, $ionicPopup, PatientService,
                         RequestsService, GlobalService) {
        var vm = this,
            currentStateName = $state.current.name;

        vm.months = [];
        vm.logs = [];
        vm.accept = accept;
        vm.decline = decline;
        vm.cancel = cancel;
        vm.update = update;
        vm.onChange = onChange;
        vm.log = null;
        vm.month = '';
        vm.buttonDisabled = false;

        PatientService.getItems().then(function (items) {
            vm.logs = items;
            vm.logList = _.chunk(items, 3);
            vm.log = vm.logs && vm.logs[0].id.toString();
            onChange();
            $scope.$on('$stateChangeSuccess', onChange);
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

        function onChange(event, stateTo) {
            if (event && stateTo.name !== currentStateName) {
                return
            }
            var patient = _.find(vm.logs, function (item) {
                return item.id == vm.log;
            });
            patient.one('doses/nonempty/first').get('').then(function (response) {
                if (response['count'] > 0) {
                    vm.buttonDisabled = false;
                    vm.months = [];
                    var currentDate = moment().startOf('month'),
                        minDate = moment(response['min_dose_date']).startOf('month');
                    while (!minDate.isAfter(currentDate)) {
                        vm.months.push({
                            id: minDate.format('YYYY_MM'),
                            name: minDate.format('MMMM YYYY'),
                            year: minDate.year(),
                            month: minDate.month()
                        });
                        minDate.add('M', 1);
                    }
                    vm.month = _.last(vm.months);
                } else {
                    vm.months = [];

                }
            });
        }
    }
})();
