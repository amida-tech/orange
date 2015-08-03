(function () {
    "use strict";

    angular
        .module('orange')
        .controller('LogsCtrl', LogsCtrl);

    LogsCtrl.$inject = ['$scope', '$state', 'logs'];

    /* @ngInject */
    function LogsCtrl($scope, $state, logs) {
        $scope.logs = _.chunk(logs, 3);

        $scope.update = update;

        function update() {
            $state.reload();

        }
    }
})();
