(function () {
    "use strict";

    angular
        .module('orange')
        .factory('OfflineService', OfflineService);

    OfflineService.$inject = ['$rootScope', '$q', 'MedicationService', 'NoteService', 'DoctorService', 'PharmacyService'];

    /* @ngInject */
    function OfflineService($rootScope, $q, MedicationService, NoteService, DoctorService, PharmacyService) {
        var service = {
            init: init,
            getItems: getItems,
            getItem: getItem,
            getMedicationEventText: MedicationService.getEventText.bind(MedicationService)
        };

        $rootScope.$on('changePatient', init);

        var services = {
            'doctors': DoctorService,
            'medications': MedicationService,
            'notes': NoteService,
            'pharmacies': PharmacyService
        };

        return service;

        ////////////////

        function init() {
            console.log('Init offline service');
            return $q.all([
                MedicationService.initItems(true),
                NoteService.initItems(true),
                DoctorService.initItems(true),
                PharmacyService.initItems(true)
            ]);

        }

        function getItems(serviceName) {
            var service = services[serviceName];

            return (service && service.getCachedItems()) || [];
        }

        function getItem(serviceName, itemId) {
            var service = services[serviceName];
            var item =  (service && service.getCachedItem(itemId));
            if (serviceName === 'medications' && item) {
                var notes = NoteService.getCachedItems();
                item.notes = _.filter(notes, function (note) {
                    return note.medication_ids.indexOf(item.id) >= 0;
                });
            }
            return item;
        }


    }

})();