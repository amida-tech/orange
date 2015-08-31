(function () {
    'use strict';

    angular
        .module('orange')
        .factory('PharmacyService', PharmacyService);

    PharmacyService.$inject = ['$rootScope', '$q', 'Patient'];

    function PharmacyService($rootScope, $q, Patient) {
        var vm = this,
            service = {
                getPharmacies: getPharmacies,
                isInfinite: isInfinite,
                morePharmacies: morePharmacies,
                setPharmacy: setPharmacy,
                getPharmacy: getPharmacy,
                removePharmacy: removePharmacy,
                savePharmacy: savePharmacy
            };

        vm.pharmacies = null;
        vm.pharmacy = null;
        vm.count = 0;
        vm.offset = 0;
        vm.limit = $rootScope.settings.defaultLimit;

        return service;

        function initPharmacies() {
            vm.offset = 0;
            return fetchPharmacies().then(function (items) {
                vm.pharmacies = items;
                vm.offset = vm.limit;
                return vm.pharmacies;
            });
        }

        function getPharmacies(force) {
            force = force || false;
            if (vm.pharmacies == null || force) {
                return initPharmacies();
            } else {
                var deferred = $q.defer();
                deferred.resolve(vm.pharmacies);
                return deferred.promise;
            }
        }

        function fetchPharmacies(offset, limit) {
            var options = {
                limit: limit || vm.limit,
                offset: offset || vm.offset
            };
            return Patient.getPatient().then(function (patient) {
                return patient.all('pharmacies').getList(options).then(function (response) {
                    vm.count = response.meta['count'];
                    return response;
                });
            });
        }

        function morePharmacies() {
            if (isInfinite()) {
                return fetchPharmacies(vm.offset).then(
                    function (items) {
                        vm.pharmacies = _.union(vm.pharmacies, items);
                        vm.offset += vm.limit;
                        return vm.pharmacies;
                    }
                )
            }
        }

        function getCount() {
            return vm.count;
        }


        function isInfinite() {
            return getCount() > vm.offset;
        }

        function setPharmacy(pharmacy) {
            vm.pharmacy = pharmacy;
        }

        function getPharmacy() {
            return vm.pharmacy;
        }
        
        function removePharmacy(pharmacy){
            return pharmacy.remove().then(function () {
                _.remove(vm.pharmacies, function (item) {
                    return item.id == pharmacy.id;
                });
                vm.count -= 1;
                vm.offset -= 1;
                return vm.pharmacies;
            });
        }

        function savePharmacy(pharmacy) {
            if (pharmacy.id) {
                return pharmacy.save();
            } else {
                return Patient.getPatient().then(function (patient) {
                    return patient.all('pharmacies').post(pharmacy).then(
                        function (newPharmacy) {
                            if (!isInfinite()) {
                                vm.pharmacies.push(newPharmacy);
                                vm.offset += 1;
                            }
                            vm.count += 1;
                        }
                    );
                });
            }
        }
    }
})();
