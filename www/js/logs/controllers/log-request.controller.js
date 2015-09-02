(function () {
    "use strict";

    angular
        .module('orange')
        .controller('RequestLogsCtrl', RequestLogsCtrl);

    RequestLogsCtrl.$inject = ['$scope', '$state', 'OrangeApi'];

    /* @ngInject */
    function RequestLogsCtrl($scope, $state, OrangeApi) {
        var service;

        $scope.sent = false;
        $scope.data = {
            email: null
        };

        if ($state.current.name === 'account-reset') {
            service = OrangeApi.user.all('reset_password');
            $scope.resetPassword = true;
            $scope.title = 'Forgot Password?';
            $scope.description = 'Please enter the Email address you used to sign up for Orange in order to receive ' +
                'the password recovery instructions.';
            $scope.buttonTitle = 'Recover password';
        } else {
            service = OrangeApi.requested;
            $scope.resetPassword = false;
            $scope.title = 'Add Existing Logs';
            $scope.description = 'To add logs from an existing account, please ' +
                'begin by sending a request to the account holder. ' +
                'Once approved, the account holder can choose ' +
                'which logs to share with you.';
            $scope.buttonTitle = 'Request Access';
        }

        $scope.errors = [];
        $scope.sendRequest = sendRequest;

        function sendRequest(form) {

            if (form.$valid) {
                $scope.errors = [];

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
