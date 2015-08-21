(function () {
    "use strict";

    angular
        .module('orange')
        .directive('changePatient', changePatient);

    changePatient.$inject = ['$state', '$stateParams', '$ionicModal',
        '$localstorage',  'Patient', 'notifications'];

    function changePatient($state, $stateParams, $ionicModal,
                           $localstorage, Patient, notify) {
        return {
            scope: {
                options: "=changePatient"
            },
            replace: true,
            templateUrl: 'templates/partial/change-patient.html',
            link: function (scope, element, attributes) {
                scope.patient = scope.$parent.patient;
                scope.patients = [];

                var patients = Patient.getPatients();
                if (patients.$$state) {
                    patients.then(function(pats) {
                        scope.patients = _.chunk(pats, 3);
                    })
                } else {
                    scope.patients = _.chunk(patients, 3);
                }

                $ionicModal.fromTemplateUrl('templates/partial/change-patient.modal.html', {
                    scope: scope,
                    animation: 'slide-in-up'
                }).then(function(modal) {
                    scope.modal = modal;
                });

                scope.screenWidth = screen.width;
                scope.changePatient = function(newPatient) {
                    $localstorage.set('currentPatient', newPatient.id);

                    scope.$parent.patient = newPatient;
                    $state.go($state.current, $stateParams, {
                        reload: true
                    });

                    notify.updateNotify();
                    scope.modal.hide();
                };

            }
        }
    }
})();
