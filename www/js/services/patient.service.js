(function () {
    "use strict";

    angular
        .module('orange')
        .factory('Patient', Patient);

    Patient.$inject = ['OrangeApi'];

    /* @ngInject */
    function Patient(OrangeApi) {
        var patient = null;

        return {
            set: set,
            patient: patient,
            habits: patient && patient.all('habits'),
            journal: patient && patient.all('journal'),
            doctors: patient && patient.all('doctors'),
            pharmacies: patient && patient.all('pharmacies'),
            medications: patient && patient.all('medications'),
            doses: patient && patient.all('doses'),
            schedule: patient && patient.all('schedule')
        };

        ////////////////

        function set(patientID) {
            patient = OrangeApi.patients.one(patientID)
        }
    }
})();
