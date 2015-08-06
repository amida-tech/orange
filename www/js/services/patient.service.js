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
            api: api,
            getPatient: getPatient
        };

        ////////////////

        function getPatient() {
            return OrangeApi.patients.one(patient);
        }

        function set(patientID) {
            console.log('Setting patient');
            patient = patientID.toString();
        }

        function api(name) {
            return OrangeApi.patients.one(patient).all(name);
        }
    }
})();
