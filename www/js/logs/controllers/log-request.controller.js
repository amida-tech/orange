(function () {
    "use strict";

    angular
        .module('orange')
        .controller('RequestLogsCtrl', RequestLogsCtrl);

    RequestLogsCtrl.$inject = ['$scope', '$state', 'OrangeApi'];

    /* @ngInject */
    function RequestLogsCtrl($scope, $state, OrangeApi) {
        $scope.sent = false;
        $scope.resetPassword = false;
        $scope.data = {
            email: null
        };

        $scope.errors = [];

        $scope.sendRequest = sendRequest;

        function sendRequest(form) {

            if (form.$valid) {
                $scope.errors = [];
                var service = OrangeApi.requested;

                if ($state.params['nextState'] === 'onboarding') {
                    service = OrangeApi.user.all('reset_password');
                    $scope.resetPassword = true;
                }

                service.post($scope.data).then(
                    function(response) {
                        console.log(response);
                        $scope.sent = true;
                        $scope.logRequestNextState = $state.params['nextState'] || 'logs';
                    },
                    function(error) {
                        error.data.errors.forEach(function (elem) {
                            $scope.errors.push(_.startCase(elem))
                        });
                    }
                );
            }
        }

    }
})();
