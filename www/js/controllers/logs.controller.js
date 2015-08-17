(function () {
    "use strict";

    angular
        .module('orange')
        .controller('LogsCtrl', LogsCtrl);

    LogsCtrl.$inject = ['$scope', '$state', 'OrangeApi'];

    /* @ngInject */
    function LogsCtrl($scope, $state, OrangeApi) {
        $scope.logs = [];
        $scope.logList = [];
        OrangeApi.patients.getList().then(
            function (patients) {
                $scope.logs = patients;
                $scope.logList = _.chunk($scope.logs, 3);
            }
        );

        $scope.update = update;

        function update() {
            $state.reload();
        }
    }
})();
