(function () {
    "use strict";

    angular
        .module('orange')
        .controller('LogsCtrl', LogsCtrl);

    LogsCtrl.$inject = ['$scope', '$state', 'OrangeApi'];

    /* @ngInject */
    function LogsCtrl($scope, $state, OrangeApi) {
        var vm = this;

        $scope.logs = [];
        $scope.logList = [];
        $scope.update = update;

        vm.editMode = false;
        vm.withMe = false;
        vm.setEditMode = setEditMode;

        getPatients();

        function getPatients() {
            OrangeApi.patients.getList().then(
                function (patients) {
                    $scope.logs = patients;
                    $scope.logList = _.chunk($scope.logs, 3);
                    vm.withMe = _.filter(patients, function (item) {
                        return item['me'] === true;
                    });
                }
            );
        }

        function update() {
            getPatients();
            $state.reload();
        }

        function setEditMode(isEditMode) {
            vm.editMode = isEditMode;
        }
    }
})();
