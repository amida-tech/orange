(function () {
    'use strict';

    angular
        .module('orange')
        .controller('SharingAcceptCtrl', SharingAcceptCtrl);

    SharingAcceptCtrl.$inject = ['$scope', '$state', '$q', '$ionicLoading', 'PatientService', 'RequestsService',
        'GlobalService'];

    function SharingAcceptCtrl($scope, $state, $q, $ionicLoading, PatientService, RequestsService, GlobalService) {
        var vm = this;

        vm.accept = accept;
        vm.request = RequestsService.getAcceptingRequest();
        vm.hasMore = PatientService.hasMore;
        vm.loadMore = loadMore;
        vm.update = update;

        update();

        function update(force) {
            force = force || false;
            vm.patientPromise = PatientService.getItems(force).then(function (patients) {
                setPatients(patients);
                if (force) {
                    $scope.$broadcast('scroll.refreshComplete');
                }
            });
        }

        function accept() {
            var selectedItems = _.filter(vm.logs, function (item) {
                return item.checked === true;
            });

            if (!selectedItems.length) {
                GlobalService.showError('No selected logs');
                return
            }

            $ionicLoading.show({
                template: 'Accepting...'
            });

            RequestsService.acceptRequest(vm.request).then(
                function () {
                    var shares = [],
                        postObject = {
                            email: vm.request.email,
                            access: 'write',
                            group: 'anyone'
                        };

                    _.each(selectedItems, function (log) {
                        shares.push(log.all('shares').post(postObject));
                    });
                    $q.all(shares).then(
                        function () {
                            goToSharing();
                        },
                        function (error) {
                            GlobalService.showError(
                                _.startCase(error.data.errors[0])
                            ).then(goToSharing);
                        }
                    );
                },
                function (error) {
                    $ionicLoading.hide();
                    GlobalService.showError(_.startCase(error.data.errors[0]));
                }
            );
        }

        function goToSharing() {
            $ionicLoading.hide();
            $state.go('app.sharing');
        }

        function loadMore() {
            var morePromise = PatientService.moreItems();
            if (vm.logs.length && morePromise) {
                morePromise.then(function (items) {
                    setPatients(items);
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        }

        function setPatients(patients) {
            vm.logs = patients;
            vm.logList = _.chunk(patients, 3);
        }
    }
})();
