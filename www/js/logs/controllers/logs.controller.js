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
        $scope.withMe = false;

        vm.editMode = false;
        vm.setEditMode = setEditMode;
        vm.details = details;

        update();

        function update(force) {
            force = force || false;
            PatientService.getItems(force).then(function (patients) {
                $scope.logs = patients;
                $scope.logList = _.chunk(patients, 3);
                $scope.withMe = !!_.find(patients, function (item) {
                    return item['me'] === true;
                });
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
            $state.go('onboarding-log.habits', {id: patient.id})
        }

        function details(patient) {
            PatientService.setItem(patient);
            $state.go('app.logs.details', {id: patient.id});
        }
    }
})();
