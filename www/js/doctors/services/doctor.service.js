(function () {
    'use strict';

    angular
        .module('orange')
        .factory('DoctorService', DoctorService);

    DoctorService.$inject = ['PatientPagingService', 'errorList'];

    function DoctorService(PatientPagingService, errorList) {
        var Service = function () {
            PatientPagingService.call(this);
            this.apiEndpoint = 'doctors';

            this.errorItemNotFound = errorList.INVALID_DOCTOR_ID;
            this.errorItemNotFoundText = 'Doctor not found';
            this.afterErrorItemNotFoundState = 'app.doctors.list';
            console.log('Start DoctorService');
        };

        Service.prototype = Object.create(PatientPagingService.prototype);

        return new Service();
    }
})();
