(function () {
    'use strict';

    angular
        .module('orange')
        .factory('DoctorService', DoctorService);

    DoctorService.$inject = ['PatientPagingService'];

    function DoctorService(PatientPagingService) {
        var Service = function () {
            PatientPagingService.call(this);
            this.apiEndpoint = 'doctors';
        };

        Service.prototype = PatientPagingService;

        return new Service();
    }
})();
