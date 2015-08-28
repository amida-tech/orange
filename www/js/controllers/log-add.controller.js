(function () {
    "use strict";

    angular
        .module('orange')
        .controller('AddLogCtrl', AddLogCtrl);

    AddLogCtrl.$inject = ['$scope', '$state', '$ionicLoading', '$ionicModal', '$cordovaCamera', 'OrangeApi',
                          'Avatar', 'LogService', 'patient', 'notifications', '$localstorage'];

    /* @ngInject */
    function AddLogCtrl($scope, $state, $ionicLoading, $ionicModal, $cordovaCamera, OrangeApi, Avatar,
                        LogService, patient, notify, $localstorage) {

        $scope.editMode = !!$state.params['editMode'];
        $scope.log = $scope.editMode ? LogService.getDetailLog(): patient;
        $scope.saveLog = $scope.editMode ? saveLogWithHabits: addLog;
        $scope.selectPhoto = selectPhoto;
        $scope.isDevice = ionic.Platform.isWebView();
        $scope.title = $scope.editMode ? 'Edit Log' : patient.me ? 'Add My Log' : 'Add New Log';
        $scope.button_title = $scope.editMode ? 'Save Log' : 'Add Log';
        $scope.iconItems = _.chunk($scope.$root.settings.avatars, 3);

        $ionicModal.fromTemplateUrl('templates/partial/logs.icon.modal.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.iconModal = modal;
        });

        $ionicModal.fromTemplateUrl('templates/partial/logs.habits.modal.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.habitsModal = modal;
        });


        function selectPhoto(iconUrl) {
            if (!$scope.isDevice || iconUrl !== undefined) {
                setAvatarUrl(iconUrl || 'img/ionic.png');
            } else {
                var options = {
                    quality: 50,
                    destinationType: Camera.DestinationType.FILE_URI,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                    allowEdit: true,
                    encodingType: Camera.EncodingType.PNG,
                    targetWidth: 120,
                    targetHeight: 120,
                    mediaType: Camera.MediaType.PICTURE,
                    //popoverOptions: CameraPopoverOptions,
                    saveToPhotoAlbum: false
                };

                $cordovaCamera.getPicture(options).then(setAvatarUrl, console.log)
            }
        }

        function setAvatarUrl(data) {
            $scope.log.avatar = null;
            $scope.log.avatarUrl = data;
            $scope.iconModal.hide();
        }

        function addLog() {
            $ionicLoading.show({
                template: 'Saving...'
            });
            saveLog();
        }

        function saveLogWithHabits() {
            $ionicLoading.show({
                template: 'Saving...'
            });
            if ($scope.log.habits) {
                $scope.log.habits.save().then(function() {
                    if ($scope.log.id == $localstorage.get('currentPatient')) {
                        notify.updateNotify();
                    }
                    saveLog()
                },
                    function (error) {
                        $ionicLoading.hide();
                        alert(error.data.errors);
                    }
                )
            } else {
                saveLog();
            }
        }

        function saveLog() {
            var avatarUrl = $scope.log.avatarUrl;

            var parts = $scope.log.fullName ? $scope.log.fullName.split(' ') : [];
            $scope.log.first_name = parts.shift() || '';
            $scope.log.last_name = parts.join(' ') || '';

            if ($scope.log.restangularized) {
                // Restangular object
                // We can just save changes
                $scope.log.birthdate = $scope.log.birthdate || null;
                if ($scope.log.birthdate instanceof Date) {
                    $scope.log.birthdate = $scope.log.birthdate.toJSON().slice(0, 10);
                }
                $scope.log.save().then(
                    function (patient) {
                        LogService.addLog(patient);
                        $scope.log = patient;
                        if (avatarUrl) {
                            $scope.log.avatarUrl = avatarUrl;
                            Avatar.upload($scope.log).then(
                                function () {
                                    Avatar.cleanCache($scope.log.id);
                                    goToNextState();
                                }, goToNextState);
                        } else {
                            goToNextState();
                        }
                    },
                    function (response) {
                        $ionicLoading.hide();
                        alert(response.data.errors);
                    }
                )
            } else {
                // Not restangular object
                // Create new patient
                OrangeApi.patients.post($scope.log).then(
                    function (patient) {
                        LogService.addLog(patient);
                        $scope.log = patient;
                        $scope.log.fullName = $scope.log.first_name + ' ' + $scope.log.last_name;
                        if (avatarUrl) {
                            $scope.log.avatarUrl = avatarUrl;
                            Avatar.upload($scope.log).then(goToNextState, goToNextState);
                        } else {
                            goToNextState();
                        }

                    },
                    function (error) {
                        $ionicLoading.hide();
                        alert(error.status);
                    }
                )
            }
        }

        function goToNextState() {
            var options = {reload: $scope.log.id == $localstorage.get('currentPatient')};
            $state.go($state.params['nextState'] || 'logs', {}, options);
            $ionicLoading.hide();
        }
    }
})();
