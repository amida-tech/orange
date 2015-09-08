(function () {
    'use strict';

    angular
        .module('orange')
        .controller('SharingAcceptCtrl', SharingAcceptCtrl);

    SharingAcceptCtrl.$inject = ['$state', '$q', '$ionicLoading', '$ionicPopup',
                                 'PatientService', 'RequestsService'];

    function SharingAcceptCtrl($state, $q, $ionicLoading, $ionicPopup, PatientService, RequestsService) {
        var vm = this;

        vm.accept = accept;
        vm.request = RequestsService.getAcceptingRequest();

        PatientService.getItems().then(function (items) {
            vm.logs = items;
            vm.logList = _.chunk(items, 3);
        });

        function accept() {
            var selectedItems = _.filter(vm.logs, function (item) {
                return item.checked === true;
            });

            if (!selectedItems.length) {
                vm.error = 'No selected logs';
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
                            $ionicPopup.alert({
                                title: 'Error',
                                template: error.data.errors
                            }).then(goToSharing);
                        }
                    );
                },
                function (error) {
                    $ionicLoading.hide();
                    vm.error = error.data.errors.join('<br>');
                }
            );
        }

        function goToSharing() {
            $ionicLoading.hide();
            $state.go('app.sharing');
        }
    }
})();
