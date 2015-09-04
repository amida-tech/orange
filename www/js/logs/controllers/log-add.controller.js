(function () {
    "use strict";

    angular
        .module('orange')
        .controller('AddLogCtrl', AddLogCtrl);

    AddLogCtrl.$inject = ['$scope', '$state', '$ionicLoading', '$ionicModal', '$cordovaCamera',
        'PatientService', 'notifications'];

    /* @ngInject */
    function AddLogCtrl($scope, $state, $ionicLoading, $ionicModal, $cordovaCamera,
                        PatientService, notify) {

        var patient = PatientService.getItem() || {};

        $scope.editMode = !!$state.params['editMode'];
        $scope.log = $scope.editMode ? patient : {};
        $scope.saveLog = $scope.editMode ? saveLogWithHabits: addLog;
        $scope.selectPhoto = selectPhoto;
        $scope.isDevice = ionic.Platform.isWebView();
        $scope.title = $scope.editMode ? 'Edit Log' : patient['me'] ? 'Add My Log' : 'Add New Log';
        $scope.button_title = $scope.editMode ? 'Save Log' : 'Add Log';
        $scope.iconItems = _.chunk($scope.settings.avatars, 3);

        $ionicModal.fromTemplateUrl('templates/logs/logs.icon.modal.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.iconModal = modal;
        });

        $ionicModal.fromTemplateUrl('templates/logs/logs.habits.modal.html', {
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
                $scope.log.habits.save().then(
                    function() {
                        if ($scope.log === PatientService.currentPatient) {
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
            PatientService.saveItem($scope.log).then(
                function (patient) {
                    console.log('log save callback');
                    $scope.log = patient;
                    $ionicLoading.hide();
                    goToNextState();
                },
                function (response) {
                    $ionicLoading.hide();
                    alert(response.data.errors);
                }
            );

        }

        function goToNextState() {
            var options = {reload: $scope.log === PatientService.currentPatient};
            $state.go($state.params['nextState'] || 'logs', {}, options);
            $ionicLoading.hide();
        }
    }
})();
