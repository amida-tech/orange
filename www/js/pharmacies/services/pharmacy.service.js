(function () {
    'use strict';

    angular
        .module('orange')
        .factory('PharmacyService', PharmacyService);

    PharmacyService.$inject = ['PatientPagingService', 'errorList'];

    function PharmacyService(PatientPagingService, errorList) {
        var Service = function () {
            PatientPagingService.call(this);
            this.apiEndpoint = 'pharmacies';

            this.errorItemNotFound = errorList.INVALID_PHARMACY_ID;
            this.errorItemNotFoundText = 'Pharmacy not found';
            this.afterErrorItemNotFoundState = 'app.pharmacies.list';
        };

        Service.prototype = Object.create(PatientPagingService.prototype);

        return new Service();
    }
})();
