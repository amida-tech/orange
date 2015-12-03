(function () {
    'use strict';

    angular
        .module('orange')
        .factory('NoteService', NoteService);

    NoteService.$inject = ['PatientPagingService', 'errorList'];

    function NoteService(PatientPagingService, errorList) {
        var Service = function () {
            PatientPagingService.call(this);
            this.apiEndpoint = 'journal';
            this.sortBy = 'date';
            this.sortOrder = 'desc';

            this.errorItemNotFound = errorList.INVALID_JOURNAL_ID;
            this.errorItemNotFoundText = 'Note not found';
            this.afterErrorItemNotFoundState = 'app.notes.list';
            console.log('Start NoteService');
        };

        Service.prototype = Object.create(PatientPagingService.prototype);

        return new Service();
    }
})();
