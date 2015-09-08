(function () {
    "use strict";

    angular
        .module('orange')
        .directive('changePatient', changePatient);

    changePatient.$inject = ['$rootScope', '$timeout', '$state', '$stateParams', '$ionicModal',
        'PatientService', 'notifications'];

    function changePatient($rootScope, $timeout, $state, $stateParams, $ionicModal,
                           PatientService, notify) {
        return {
            scope: {
                options: "=changePatient"
            },
            replace: true,
            templateUrl: 'templates/core/change-patient.html',
            link: function (scope, element, attributes) {
                PatientService.getPatient().then(function (patient) {
                    scope.patient = patient;
                });
                scope.patients = [];

                scope.screenWidth = screen.width;
                scope.changePatient = function(newPatient) {
                    PatientService.setCurrentPatient(newPatient);
                    $state.go($state.current, $stateParams, {
                        reload: true
                    });

                    notify.updateNotify(true);
                    $rootScope.$broadcast('changePatient');
                    scope.modal.hide();
                };

                scope.setPatients = function (force) {
                    PatientService.getItems(force).then(function (patients) {
                        scope.patients = _.chunk(patients, 3);
                        $rootScope.$broadcast('scroll.refreshComplete');
                    });
                };

                scope.hasMore = PatientService.hasMore;

                scope.loadMore = function () {
                    var morePromise = PatientService.moreItems();
                    if (scope.patients.length && morePromise) {
                        morePromise.then(function (items) {
                            scope.patients = _.chunk(items, 3);
                            $rootScope.$broadcast('scroll.infiniteScrollComplete');
                        });
                    } else {
                        $rootScope.$broadcast('scroll.infiniteScrollComplete');
                    }
                };

                scope.showModal = function () {
                    scope.setPatients();
                    scope.modal.show();
                };

                $timeout(function() {
                    $ionicModal.fromTemplateUrl('templates/core/change-patient.modal.html', {
                        scope: scope,
                        animation: 'slide-in-up'
                    }).then(function(modal) {
                        scope.modal = modal;
                    });
                }, 100);
            }
        }
    }
})();
