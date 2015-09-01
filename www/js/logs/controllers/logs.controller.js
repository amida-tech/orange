(function () {
    "use strict";

    angular
        .module('orange')
        .controller('LogsCtrl', LogsCtrl);

    LogsCtrl.$inject = ['$scope', 'LogService'];

    /* @ngInject */
    function LogsCtrl($scope, LogService) {
        var vm = this;

        $scope.logs = [];
        $scope.logList = [];
        $scope.update = update;
        $scope.withMe = false;

        vm.editMode = false;
        vm.setEditMode = setEditMode;

        getPatients();

        function getPatients(force) {
            $scope.logs = LogService.getLogs(force).then(function (patients) {
                $scope.logList = _.chunk(patients, 3);
                $scope.withMe = _.filter(patients, function (item) {
                    return item['me'] === true;
                });
                if (force) {
                    $scope.$broadcast('scroll.refreshComplete');
                }
            });
        }

        function update() {
            getPatients(true);
        }

        function setEditMode(isEditMode) {
            vm.editMode = isEditMode;
        }
    }
})();
