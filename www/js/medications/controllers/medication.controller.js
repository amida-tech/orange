(function () {
    "use strict";

    angular
        .module('orange')
        .controller('MedicationCtrl', MedicationCtrl);

    MedicationCtrl.$inject = ['$scope', '$state', '$stateParams', '$ionicLoading', '$ionicPopup', 'notifications',
        'MedicationService', 'NoteService', 'GlobalService'];

    function MedicationCtrl($scope, $state, $stateParams, $ionicLoading, $ionicPopup, notify,
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
                if (medication.id) {
                    MedicationService.getNotifications().then(function (times) {
                        vm.medication = medication;
                        vm.times = times;
                        setStatus();
                        vm.eventsText = MedicationService.getMedicationText(vm.medication);
                        updateNotificationTexts();

                    });

                    NoteService.getAllItems().then(
                        function (notes) {
                            if (notes) {
                                vm.notes = _.filter(notes, function (note) {
                                    return note.medication_ids.indexOf(medication.id) >= 0;
                                });
                            } else {
                                vm.notes = [];
                            }
                        }
                    );
                } else {
                    vm.medication = medication;
                    setStatus();
                }

            },
            function (error) {
                if (error.data.errors[0] === MedicationService.errorItemNotFound) {
                    $state.go('app.medications');
                }
            }
        );
        vm.getEventText = MedicationService.getEventText.bind(MedicationService);
        vm.changeStatus = changeStatus;
        vm.getNotificationText = getNotificationText;
        vm.changeNotificaitonTime = changeNotificaitonTime;


        function updateNotificationTexts() {
            vm.times.forEach(function (item, index) {
                vm.medication.schedule.times[index].notificationText = getNotificationText(item);
            });
        }

        function clearNotificationTexts() {
            vm.times.forEach(function (item, index) {
                delete vm.medication.schedule.times[index].notificationText;
            });
        }

        function getNotificationText(time) {
            var result = '';
            var onIcon = '<i class="ion-android-notifications"></i>';
            var offIcon = '<i class="ion-android-notifications-off"></i>';
            var delay = time.user;
            if (delay === 'default') {
                delay = _.isNumber(time.default) ? time.default : 30;
            }

            if (delay === 'paused') {
                result = 'Off&nbsp;&nbsp;' + offIcon;
            } else if (delay === 0) {
                result = 'Exact Time&nbsp;&nbsp;' + onIcon;
            } else if (delay < 60) {
                result = delay + '&nbsp;Min.&nbsp;&nbsp;' + onIcon;
            } else {
                result = 1 + '&nbsp;Hour&nbsp;&nbsp;' + onIcon;
            }
            return result;
        }

        function setStatus() {
            vm.status = vm.medication.status === 'active' ? 'Status' : _.startCase(vm.medication.status);
        }

        function changeNotificaitonTime(index) {
            var time = vm.times[index];
            $scope.notification = {
                value: time.user === 'default' ? time.default.toString() : time.user.toString()
            };

            $ionicPopup.show({
                templateUrl: 'templates/medications/medication.notification.html',
                title: 'Change notification time',
                scope: $scope,
                buttons: [
                    {
                        text: 'Cancel',
                        type: 'button-default'
                    },
                    {
                        text: 'Ok',
                        type: 'button-dark-orange',
                        onTap: function (e) {
                            var value = $scope.notification.value === 'paused' ? 'paused' : parseInt($scope.notification.value);
                            if (value !== time.user) {
                                $ionicLoading.show({
                                    template: 'Saving...'
                                });
                                MedicationService.updateNotification(vm.medication.schedule.times[index].id, value).then(function (time) {
                                    vm.times[index].user = value;
                                    updateNotificationTexts();
                                    notify.updateNotify();
                                }).finally($ionicLoading.hide);
                            }
                        }
                    }
                ]
            })
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
                    clearNotificationTexts();
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
