(function () {
    "use strict";

    angular
        .module('orange')
        .controller('AddLogCtrl', AddLogCtrl);

    AddLogCtrl.$inject = ['$scope', '$state', '$stateParams', '$ionicLoading', '$ionicModal', '$cordovaCamera',
        'PatientService', 'notifications'];

    /* @ngInject */
    function AddLogCtrl($scope, $state, $stateParams, $ionicLoading, $ionicModal, $cordovaCamera,
                        PatientService, notify) {

        $scope.editMode = !!$state.params['editMode'];
        $scope.saveLog = saveLog;
        $scope.checkForm = checkForm;
        $scope.selectPhoto = selectPhoto;
        $scope.isDevice = ionic.Platform.isWebView();
        $scope.button_title = $scope.editMode ? 'Save Log' : 'Add Log';
        $scope.iconItems = _.chunk($scope.settings.avatars, 3);
        $scope.backState = ($scope.editMode && !$state.params['fromMedication'])
                           ? 'app.logs.details({id: ' + $stateParams.id + '})'
                           : $state.params['nextState'];
        $scope.errors = [];

        if ('id' in $stateParams) {
            PatientService.getItem($stateParams['id'], true).then(function (patient) {
                $scope.editLog = $scope.editMode ? patient : {};
                $scope.title = 'Edit Log';
            })
        } else {
            $scope.editLog = {};
            $scope.title = 'Add New Log';
        }


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

                $cordovaCamera.getPicture(options).then(
                    setAvatarUrl,
                    function (error) {
                        $scope.errors = [error];
                    }
                );
            }
        }

        function setAvatarUrl(data) {
            $scope.editLog.avatar = null;
            $scope.editLog.avatarUrl = data;
            $scope.iconModal.hide();
        }

        function checkForm(form) {
            form.$submitted = true;
            return _.isEmpty(form.$error);
        }

        function saveLog() {
            $ionicLoading.show({
                template: 'Saving...'
            });
            PatientService.saveItem($scope.editLog).then(
                function (patient) {
                    if ($scope.log.id == PatientService.currentPatient.id) {
                        notify.updateNotify();
                    }
                    PatientService.setItem(null);
                    $scope.editLog = patient;
                    $ionicLoading.hide();
                    goToNextState();
                },
                function (error) {
                    $ionicLoading.hide();
                    $scope.errors = _.map(error.data.errors, _.startCase);
                }
            );

        }

        function goToNextState() {
            var options = {reload: $scope.editLog['id'] === PatientService.currentPatient['id']};
            $state.go($state.params['nextState'] || 'logs', {}, options);
            $ionicLoading.hide();
        }
    }
})();
