(function () {
    'use strict';

    angular
        .module('orange')
        .factory('PharmacyService', PharmacyService);

    PharmacyService.$inject = ['PatientPagingService'];

    function PharmacyService(PatientPagingService) {
        var Service = function () {
            PatientPagingService.call(this);
            this.apiEndpoint = 'pharmacies';
        };

        Service.prototype = PatientPagingService;

        return new Service();
    }
})();
