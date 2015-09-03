(function () {
    'use strict';

    angular
        .module('orange')
        .factory('NoteService', NoteService);

    NoteService.$inject = ['PagingService'];

    function NoteService(PagingService) {
        var Service = function () {
            PagingService.constructor.call(this);
            this.apiEndpoint = 'journal';
            this.sortBy = 'date';
            this.sortOrder = 'desc';
        };

        Service.prototype = PagingService;

        return new Service();
    }
})();
