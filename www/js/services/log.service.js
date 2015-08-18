(function () {
    'use strict';

    angular
        .module('orange')
        .factory('LogService', LogService);

    LogService.$inject = ['$q', 'OrangeApi'];

    function LogService($q, OrangeApi) {
        var vm = this,
            service = {
                addLog: addLog,
                clearLog: clearLog,
                getDetailLog: getDetailLog,
                getLog: getLog,
                getLogs: getLogs,
                removeLog: removeLog,
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
            vm.detailLog = _.find(vm.logs, function (item) {
                return item.id == logId;
            });
            setFullName(vm.detailLog);
            vm.detailLog.one('habits').get('').then(
                function (habits) {
                    vm.detailLog.habits = habits;
                }
            );
            return vm.detailLog;
        }

        function getDetailLog() {
            return vm.detailLog;
        }

        function setFullName(log) {
            log.fullName = log.first_name + ' ' + log.last_name;
        }

        function addLog(log) {
            var existLog = _.find(vm.logs, function (item) {
                if (item.id === log.id) {
                    item.first_name = log.first_name;
                    item.last_name = log.last_name;
                    return true;
                }
            });
            if (!existLog) {
                vm.logs.push(log);
            }
        }

        function removeLog(log) {
            var logIndex = vm.logs.indexOf(log);
            return log.remove().then(
                function () {
                    if (logIndex > -1) {
                        vm.logs.splice(logIndex, 1);
                    }
                }
            );
        }
    }
})();
