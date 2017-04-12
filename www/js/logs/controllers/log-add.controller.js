(function () {
    "use strict";

    angular
        .module('orange')
        .controller('AddLogCtrl', AddLogCtrl);

    AddLogCtrl.$inject = ['$scope', '$state', '$stateParams', '$ionicLoading', '$ionicModal', '$cordovaCamera',
        'PatientService', 'notifications', 'Auth'];

    /* @ngInject */
    function AddLogCtrl($scope, $state, $stateParams, $ionicLoading, $ionicModal, $cordovaCamera,
                        PatientService, notify, Auth) {

        $scope.editMode = !!$state.params['editMode'];
        $scope.saveLog = saveLog;
        $scope.checkForm = checkForm;
        $scope.selectPhoto = selectPhoto;
        $scope.isDevice = ionic.Platform.isWebView();
        $scope.button_title = $scope.editMode ? 'Save Log' : 'Add Log';
        $scope.iconItems = _.chunk($scope.settings.avatars, 3);
        $scope.backState = $state.params['backState'] + '({id: ' + $stateParams.id + '})';
        $scope.errors = [];
        $scope.habitsDone = habitsDone;
        $scope.habitsErrors = [];
        $scope.habitsForm = {};
        $scope.withHabits = $scope.editMode && $state.current.name !== 'logs-edit';

        var birthDateErrorMessage = 'Invalid Date of Birth';

        if ('id' in $stateParams) {
            PatientService.getItem($stateParams['id'], true).then(function (patient) {
                $scope.editLog = $scope.editMode ? patient : {};
                $scope.habits = PatientService.fillHabits(angular.copy($scope.editLog.habits) || {});
                $scope.title = 'Edit Log';
            })
        } else {
            $scope.editLog = {};
            $scope.title = 'Add New Log';
        }

        $scope.$watch('editLog.birthdate', function(newVal) {

            if (newVal && moment(newVal, 'YYYY-MM-DD') > moment()) {
                console.warn(birthDateErrorMessage);
                $scope.errors.push(birthDateErrorMessage);
            } else {
                var index = $scope.errors.indexOf(birthDateErrorMessage);
                if (index >= 0) {
                    $scope.errors.splice(index, 1);
                }

            }

        });


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
            return _.isEmpty(form.$error) && !$scope.errors.length;
        }

        function saveLog() {
            $ionicLoading.show({
                template: 'Saving...'
            });
            $scope.editLog.habits = $scope.habits;
            PatientService.saveItem($scope.editLog).then(
                function (patient) {
                    if (!_.isUndefined($scope.log) && $scope.log.id == PatientService.currentPatient.id) {
                        notify.updateNotify();
                    }
                    PatientService.setItem(null);
                    $scope.editLog = patient;
                    if (patient.me) {
                        var user = {
                            first_name: patient.first_name,
                            last_name: patient.last_name,
                            phone: patient.phone
                        };
                        Auth.update(user).finally(function() {
                            $ionicLoading.hide();
                            goToNextState();
                        });
                    } else {
                        $ionicLoading.hide();
                        goToNextState();
                    }

                },
                function (error) {
                    $ionicLoading.hide();
                    $scope.errors = _.map(error.data.errors, _.startCase);
                }
            );

        }

        function goToNextState() {
            var options = {reload: $scope.editLog.id === PatientService.currentPatient.id};
            $state.go($state.params['nextState'] || 'logs', {}, options);
            $ionicLoading.hide();
        }

        function habitsDone() {
            if (!$scope.habits || !_.every([
                    $scope.habits['wake'],
                    $scope.habits['breakfast'],
                    $scope.habits['dinner'],
                    $scope.habits['lunch'],
                    $scope.habits['sleep']])) {
                $scope.habitsErrors = ['Please fill all habits'];
            } else {
                $scope.habitsErrors = [];
                $scope.habitsModal.hide();
            }
        }
    }
})();
