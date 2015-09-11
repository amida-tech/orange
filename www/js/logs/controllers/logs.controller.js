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
        $scope.logList = [];
        $scope.update = update;
        $scope.habits = habits;
        $scope.hasMore = PatientService.hasMore;
        $scope.loadMore = loadMore;
        $scope.withMe = false;

        vm.editMode = false;
        vm.setEditMode = setEditMode;
        vm.details = details;

        update();

        function update(force) {
            force = force || false;
            vm.patientPromise = PatientService.getItems(force).then(function (patients) {
                setPatients(patients);
                if (force) {
                    $scope.$broadcast('scroll.refreshComplete');
                }
            });
        }

        function setEditMode(isEditMode) {
            vm.editMode = isEditMode;
        }

        function habits(patient) {
            PatientService.setItem(patient);
            $state.go('onboarding-log.habits', {patient_id: patient.id})
        }

        function details(patient) {
            PatientService.setItem(patient);
            $state.go('app.logs.details', {id: patient.id});
        }

        function loadMore() {
            var morePromise = PatientService.moreItems();
            if ($scope.logs.length && morePromise) {
                morePromise.then(function (items) {
                    setPatients(items);
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        }

        function setPatients(patients) {
            $scope.logs = patients;
            $scope.logList = _.chunk(patients, 3);
            $scope.withMe = !!_.find(patients, function (item) {
                return item['me'] === true;
            });
        }
    }
})();
