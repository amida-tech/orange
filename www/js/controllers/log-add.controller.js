(function () {
    "use strict";

    angular
        .module('orange')
        .controller('AddLogCtrl', AddLogCtrl);

    AddLogCtrl.$inject = ['$scope', '$state', '$ionicLoading', '$ionicModal', '$cordovaCamera', 'OrangeApi',
                          'Avatar', 'settings', 'log'];

    /* @ngInject */
    function AddLogCtrl($scope, $state, $ionicLoading, $ionicModal, $cordovaCamera, OrangeApi, Avatar,
                        settings, log) {

        $scope.log = log;
        $scope.saveLog = saveLog;
        $scope.selectPhoto = selectPhoto;
        $scope.isDevice = ionic.Platform.isWebView();
        $scope.title = log.me ? 'Add My Log' : 'Add New Log';
        $scope.iconItems = _.chunk(settings.avatars, 3);

        $ionicModal.fromTemplateUrl('templates/partial/logs.icon.modal.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.iconModal = modal;
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

        function saveLog() {
            var avatarUrl = $scope.log.avatarUrl;

            $ionicLoading.show({
                template: 'Saving...'
            });

            if ($scope.log.restangularized) {
                // Restangular object
                // We can just save changes
                $scope.log.birthdate = $scope.log.birthdate || null;
                if ($scope.log.birthdate instanceof Date) {
                    $scope.log.birthdate = $scope.log.birthdate.toJSON().slice(0, 10);
                }
                $scope.log.save().then(
                    function (patient) {
                        $scope.log = patient;
                        if (avatarUrl) {
                            $scope.log.avatarUrl = avatarUrl;
                            Avatar.upload($scope.log).then(
                                function () {
                                    Avatar.cleanCache($scope.log.id);
                                    $state.go('logs');
                                    $ionicLoading.hide();
                                }, function () {
                                    $state.go('logs');
                                    $ionicLoading.hide();
                                })
                        } else {
                            $state.go('logs');
                            $ionicLoading.hide();
                        }
                    },
                    function (response) {
                        alert(response.data.errors);
                    }
                )
            } else {
                // Not restangular object
                // Create new patient
                var parts = $scope.log.fullName ? $scope.log.fullName.split(' ') : [];
                $scope.log.first_name = parts.shift() || '';
                $scope.log.last_name = parts.join(' ') || '';

                OrangeApi.patients.post($scope.log).then(
                    function (patient) {
                        $scope.log = patient;
                        $scope.log.fullName = $scope.log.first_name + ' ' + $scope.log.last_name;
                        if (avatarUrl) {
                            $scope.log.avatarUrl = avatarUrl;
                            Avatar.upload($scope.log).then(
                                function () {
                                    $state.go('logs');
                                    $ionicLoading.hide();
                                }, function () {
                                    $ionicLoading.hide();
                                    $state.go('logs');
                                })
                        } else {
                            $ionicLoading.hide();
                            $state.go('logs');
                        }

                    },
                    function (error) {
                        alert(error.status);
                    }
                )
            }
        }
    }
})();
