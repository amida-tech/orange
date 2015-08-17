(function () {
    "use strict";

    angular
        .module('orange')
        .factory('medications', medications);

    medications.$inject = ['$q', 'OrangeApi'];

    /* @ngInject */
    function medications($q, OrangeApi) {
        var vm = this;
        var service = {
            getAll: getAll,
            fetchAll: fetchAll,
            getMedications: getMedications,
            remove: remove,
            setLog: setLog
        };



        vm.medications = null;
        vm.medication = null;
        vm.log = null;


        return service;

        ////////////////

        function getMedications() {
            return vm.medications;
        }

        function setLog(log) {
            vm.log = log;
        }

        function getAll() {
            var deffered = $q.defer();
            if (vm.medications !== null) {
                deffered.resolve(vm.medications);
                return deffered.promise;
            } else {
                return fetchAll();
            }
        }

        function remove(medication) {
            var deffered = $q.defer();

            medication.remove().then(
                function() {
                    if (vm.medications !== null) {
                        vm.medications = _.without(vm.medications, medication);
                    }
                    deffered.resolve();
                },
                function(error) {
                    deffered.reject(error);
                }
            );
            return deffered.promise;
        }

        function fetchAll() {
            var deffered = $q.defer();

            vm.log.all('medications').getList().then(
                function(medications) {
                    vm.medications = medications;
                    deffered.resolve(medications);
                },
                function(error) {
                    deffered.reject(error);
                }
            );
            return deffered.promise;
        }
    }
})();
