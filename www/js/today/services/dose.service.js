(function () {
    'use strict';

    angular
        .module('orange')
        .factory('DoseService', DoseService);

    DoseService.$inject = ['PatientPagingService', 'errorList'];

    function DoseService(PatientPagingService, errorList) {
        var Service = function () {
            PatientPagingService.call(this);
            this.apiEndpoint = 'doses';

            this.errorItemNotFound = errorList.INVALID_DOSE_ID;
            this.errorItemNotFoundText = 'Dose not found';
        };

        Service.prototype = Object.create(PatientPagingService.prototype);

        return new Service();
    }
})();
