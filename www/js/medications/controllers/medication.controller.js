(function () {
    "use strict";

    angular
        .module('orange')
        .controller('MedicationCtrl', MedicationCtrl);

    MedicationCtrl.$inject = ['$scope', '$state', '$stateParams', '$ionicLoading', '$ionicPopup',
        'MedicationService', 'NoteService', 'GlobalService'];

    function MedicationCtrl($scope, $state, $stateParams, $ionicLoading, $ionicPopup,
                            MedicationService, NoteService, GlobalService) {
        var vm = this;
        vm.medicationStatusMap = {
            manual: 'Manually Entered',
            import: 'Automatic Imported'
        };
        vm.notes = null;
        vm.title = 'Medication Details';
        MedicationService.getItem($stateParams['id']).then(
            function (medication) {
                vm.medication = medication;
                NoteService.getAllItems().then(
                    function (notes) {
                        vm.notes = _.filter(notes, function (note) {
                            return note.medication_ids.indexOf(vm.medication.id) >= 0;
                        });
                    }
                );
                vm.eventsText = MedicationService.getMedicationText(vm.medication);
                setStatus();
            },
            function (error) {
                if (error.data.errors[0] === MedicationService.errorItemNotFound) {
                    $state.go('app.medications');
                }
            }
        );
        vm.getEventText = MedicationService.getEventText.bind(MedicationService);
        vm.changeStatus = changeStatus;

        function setStatus() {
            vm.status = vm.medication.status === 'active' ? 'Status' : _.startCase(vm.medication.status);
        }

        function changeStatus() {
            $scope.statusData = {
                currentStatus: _.startCase(vm.medication.status),
                selectedStatus: vm.medication.status
            };
            $ionicPopup.show({
                templateUrl: 'templates/medications/medication.status.html',
                title: 'Change Status',
                scope: $scope,
                buttons: [
                    {
                        text: 'Cancel',
                        type: 'button-default'
                    },
                    {
                        text: 'Confirm',
                        type: 'button-dark-orange',
                        onTap: function (e) {
                            if (vm.medication.status === $scope.statusData.selectedStatus) {
                                $scope.statusData['viewError'] = true;
                                e.preventDefault();
                            } else {
                                return true;
                            }
                        }
                    }
                ]
            }).then(function (confirm) {
                if (confirm) {
                    if ($scope.statusData.selectedStatus === 'delete') {
                        remove(vm.medication);
                    } else {
                        vm.medication.status = $scope.statusData['selectedStatus'];
                        $ionicLoading.show({
                            template: 'Saving...'
                        });
                        MedicationService.saveItem(vm.medication).then(
                            successCallback, errorCallback
                        ).finally($ionicLoading.hide);
                    }
                }
            });
        }

        function remove(medication) {
            $ionicPopup.confirm({
                title: 'Delete Medication',
                template: 'Caution! If you delete this medication from your record, you will ' +
                    'no longer have access to your logs.<br><br>' +
                    'This cannot be undone. Once your record is deleted, it cannot be recovered.<br><br>' +
                    'Are you sure you want to continue?',
                okType: 'button-dark-orange',
                okText: 'Delete This Log'
            }).then(function (confirm) {
                if (confirm) {
                    $ionicLoading.show({
                        template: 'Deleting…'
                    });

                    MedicationService.removeItem(medication).then(
                        successCallback, errorCallback
                    ).finally($ionicLoading.hide);
                }
            });
        }

        function successCallback() {
            MedicationService.setItem(null);
            $state.go('app.medications');
        }

        function errorCallback(error) {
            if (error.data.errors[0] === MedicationService.errorItemNotFound) {
                $state.go('app.medications');
            } else {
                GlobalService.showError(error.data.errors[0]);
            }
        }
    }
})();
