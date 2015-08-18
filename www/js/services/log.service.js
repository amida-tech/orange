(function () {
    'use strict';

    angular
        .module('orange')
        .factory('LogService', LogService);

    LogService.$inject = ['$q', 'OrangeApi'];

    function LogService($q, OrangeApi) {
        var vm = this,
            service = {
                clearLog: clearLog,
                getDetailLog: getDetailLog,
                getLog: getLog,
                getLogs: getLogs,
                setDetailLog: setDetailLog,
                setLog: setLog
            };

        vm.logs = null;
        vm.log = null;
        vm.detailLog = null;

        return service;


        function setLogs(logs) {
            vm.logs = logs;
        }

        function getLogs(force) {
            force = force || false;
            var deferred = $q.defer();
            if (vm.logs !== null && !force) {
                deferred.resolve(vm.logs);
                return deferred.promise;
            } else {
                return initLogs();
            }
        }

        function initLogs() {
            return OrangeApi.patients.getList().then(
                function (patients) {
                    setLogs(patients);
                    return patients;
                }
            );
        }

        function setLog(log) {
            vm.log = log;
        }

        function getLog() {
            return vm.log
        }

        function clearLog() {
            setLog(null);
        }

        function setDetailLog(logId) {
            return OrangeApi.patients.get(logId).then(
                function (item) {
                    vm.detailLog = item;
                    setFullName(item);
                    item.one('habits').get('').then(
                        function (habits) {
                            item.habits = habits;
                        }
                    );
                    return item;
                }
            );
        }

        function getDetailLog() {
            return vm.detailLog;
        }

        function setFullName(log) {
            log.fullName = log.first_name + ' ' + log.last_name;
        }
    }
})();
