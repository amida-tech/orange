(function () {
    "use strict";

    angular
        .module('orange')
        .factory('Patient', Patient);

    Patient.$inject = ['$rootScope', '$q', '$state', '$ionicLoading', 'OrangeApi', '$localstorage'];

    /* @ngInject */
    function Patient($rootScope, $q, $state, $ionicLoading, OrangeApi, $localstorage) {
        var patient = null;
        var patients = [];

        $rootScope.$on('auth:user:logout', clean);

        return {
            set: set,
            api: api,
            getReport: getReport,
            getPatient: getPatient,
            getPatients: getPatients,
            changeStateByPatient: changeStateByPatient
        };

        ////////////////

        function clean() {
            console.log('User logged out, cleaning patient service data...');
            patient = null;
            patients = [];
            $localstorage.remove('currentPatient');
        }

        //Cache patients list
        function getPatients(force) {
            force = force || false;
            if (!_.isEmpty(patients) && !force) {
                return patients
            }
            var promise = OrangeApi.patients.getList();

            promise.then(function(pats) {
                if (!pats.length) {
                    $state.go('logs');
                    return pats;
                }
                patients = pats;
            });

            return promise
        }

        function getPatient(force) {
            force = force || false;
            if (force) {
                $localstorage.remove('currentPatient');
            }

            //Patient promise
            var deffered = $q.defer();

            //Get patient from cache
            if (patient != null && !$state.reload && !force) {
                deffered.resolve(patient);
                return deffered
            }

            var currentPatient = $localstorage.get('currentPatient', null);

            //Get patient by id
            if (currentPatient  && !force) {
                OrangeApi.patients.get(currentPatient).then(function(currentPatient) {
                    $ionicLoading.hide();
                    deffered.resolve(currentPatient)
                }, errorGetPatients);

                deffered.promise.then(function(pat) {
                    patient = pat;
                });
                return deffered.promise;
            }

            $ionicLoading.show({
                template: 'Loading patient data...'
            });

            //Get first patient with medication
            OrangeApi.patients.getList().then(checkMedication, errorGetPatients);

            function checkMedication(patients) {
                if (patients[0]) {
                    if (currentPatient == null) {
                        currentPatient = patients[0];
                    }
                    patients[0].all('medications').getList({limit: 1}).then(function(medication) {
                        if (!_.isUndefined(medication[0])) {
                            $ionicLoading.hide();
                            $localstorage.set('currentPatient', patients[0].id);
                            deffered.resolve(patients[0]);
                            return;
                        }

                        checkMedication(patients.slice(1));
                    });
                }

                if (currentPatient != null)
                    $localstorage.set('currentPatient', currentPatient.id);

                deffered.resolve(currentPatient);
            }

            function errorGetPatients(response) {
                console.log('error get patients');
                $ionicLoading.hide();
                deffered.resolve(null);
            }

            deffered.promise.then(function(pat) {
                $ionicLoading.hide();
                patient = pat;
            });

            return deffered.promise
        }

        function set(patientID) {
            patient = patientID.toString();
        }

        function api(name) {
            return OrangeApi.patients.one(patient).all(name);
        }

        function changeStateByPatient() {
            var patient = getPatient();
            //Change state by patient
            patient.then(function(pat) {
                 if (pat != null) {
                     pat.all('medications').getList({limit: 1}).then(function(medication) {
                         if (!_.isUndefined(medication[0])) {
                             $state.go('app.today.schedule');
                             return;
                         }
                         $state.go('logs');
                     });

                     return pat;
                 }
                 $state.go('logs');
            });
        }

        function getReport(patientId, month) {
            var year = (new Date()).getFullYear(),
                startDate = new Date(Date.UTC(year, month, 1)),
                endDate = new Date(Date.UTC(year, parseInt(month) + 1, 0));
            return OrangeApi.patients.withHttpConfig({
                responseType: 'arraybuffer'
            }).get(
                patientId + '.pdf', {
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0]
                }
            );
        }
    }
})();
