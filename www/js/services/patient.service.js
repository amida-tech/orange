(function () {
    "use strict";

    angular
        .module('orange')
        .factory('Patient', Patient);

    Patient.$inject = ['OrangeApi', '$state', '$localstorage', '$q', '$ionicLoading'];

    /* @ngInject */
    function Patient(OrangeApi, $state, $localstorage, $q, $ionicLoading) {
        var patient = null;
        var patients = [];

        return {
            set: set,
            api: api,
            getReport: getReport,
            getPatient: getPatient,
            getPatients: getPatients,
            changeStateByPatient: changeStateByPatient
        };

        ////////////////

        //Cache patients list
        function getPatients() {
            if (!_.isEmpty(patients)) {
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

        function getPatient() {
            //Get patient from cache
            if (patient != null && !$state.reload) {
                return patient
            }

            $ionicLoading.show({
                template: 'Load patient...'
            });

            var currentPatient = $localstorage.get('currentPatient', null);
            //Patient promise
            var deffered = $q.defer();

            //Get patient by id
            if (currentPatient) {
                OrangeApi.patients.get(currentPatient).then(function(currentPatient) {
                    $ionicLoading.hide();
                    deffered.resolve(currentPatient)
                }, errorGetPatients);

                deffered.promise.then(function(pat) {
                    patient = pat;
                });
                return deffered.promise;
            }


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

        function getReport(patientId) {
            return OrangeApi.patients.withHttpConfig({
                responseType: 'arraybuffer'
            }).get(patientId + '.pdf');
        }
    }
})();
