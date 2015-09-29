(function () {
    "use strict";

    angular
        .module('orange')
        .controller('LogsCtrl', LogsCtrl);

    LogsCtrl.$inject = ['$scope', '$state', 'PatientService'];

    /* @ngInject */
    function LogsCtrl($scope, $state, PatientService) {
        var vm = this;

        $scope.logs = [];
        $scope.update = update;
        $scope.habits = habits;
        $scope.hasMore = PatientService.hasMore;
        $scope.loadMore = loadMore;
        $scope.withMe = false;

        vm.logList = [];
        vm.details = details;
        vm.edit = edit;
        vm.backState = $state.params['from_medication']
                       ? 'onboarding-log.medications.list({patient_id:'+ $state.params['log_id'] +'})'
                       : 'logs';

        PatientService.onListChanged(function (event, patients) {
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.logs = patients;
            vm.logList = _.chunk(patients, 3);
            $scope.withMe = !!_.find(patients, function (item) {
                return item['me'] === true;
            });
        });

        update();

        function update(force) {
            force = force || false;
            vm.patientPromise = PatientService.getItems(force);
        }

        function habits(patient) {
            PatientService.setItem(patient);
            $state.go('onboarding-log.habits', {patient_id: patient.id})
        }

        function details(patient) {
            PatientService.setItem(patient);
            $state.go('app.logs.details', {id: patient.id});
        }

        function edit(patient) {
            PatientService.setItem(patient);
            $state.go('logs-edit', {id: patient.id});
        }

        function loadMore() {
            var morePromise = PatientService.moreItems();
            if (!($scope.logs.length && morePromise)) {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        }
    }
})();
