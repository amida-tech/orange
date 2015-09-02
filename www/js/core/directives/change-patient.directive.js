(function () {
    "use strict";

    angular
        .module('orange')
        .directive('changePatient', changePatient);

    changePatient.$inject = ['$rootScope', '$timeout', '$state', '$stateParams', '$ionicModal',
        '$localstorage',  'Patient', 'notifications'];

    function changePatient($rootScope, $timeout, $state, $stateParams, $ionicModal,
                           $localstorage, Patient, notify) {
        return {
            replace: true,
            templateUrl: 'templates/core/change-patient.html',
            link: function (scope, element, attributes) {
                scope.patient = scope.$parent.patient;
                scope.patients = [];

                scope.screenWidth = screen.width;
                scope.changePatient = function(newPatient) {
                    $localstorage.set('currentPatient', newPatient.id);

                    scope.$parent.patient = newPatient;
                    $state.go($state.current, $stateParams, {
                        reload: true
                    });

                    $localstorage.remove('triggeredEvents');
                    notify.updateNotify();
                    scope.modal.hide();
                };

                scope.setPatients = function (force) {
                    var patients = Patient.getPatients(force);
                    if (patients.$$state) {
                        patients.then(function(pats) {
                            scope.patients = _.chunk(pats, 3);
                            $rootScope.$broadcast('scroll.refreshComplete');
                        })
                    } else {
                        scope.patients = _.chunk(patients, 3);
                        $rootScope.$broadcast('scroll.refreshComplete');
                    }
                };

                scope.setPatients();


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
