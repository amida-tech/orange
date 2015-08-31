(function () {
    'use strict';

    angular
        .module('orange')
        .factory('DoctorService', DoctorService);

    DoctorService.$inject = ['PagingService'];

    function DoctorService(PagingService) {
        var Service = function () {
            PagingService.constructor.call(this);
            this.apiUrl = 'doctors';
        };

        Service.prototype = PagingService;

        return new Service();
    }
})();
