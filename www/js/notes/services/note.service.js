(function () {
    'use strict';

    angular
        .module('orange')
        .factory('NoteService', NoteService);

    NoteService.$inject = ['PatientPagingService'];

    function NoteService(PatientPagingService) {
        var Service = function () {
            PatientPagingService.call(this);
            this.apiEndpoint = 'journal';
            this.sortBy = 'date';
            this.sortOrder = 'desc';
        };

        Service.prototype = PatientPagingService;

        return new Service();
    }
})();
