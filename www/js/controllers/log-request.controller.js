(function () {
    "use strict";

    angular
        .module('orange')
        .controller('RequestLogsCtrl', RequestLogsCtrl);

    RequestLogsCtrl.$inject = ['$scope', 'OrangeApi'];

    /* @ngInject */
    function RequestLogsCtrl($scope, OrangeApi) {
        $scope.sent = false;
        $scope.data = {
            email: null
        };

        $scope.errors = [];

        $scope.sendRequest = sendRequest;

        function sendRequest(form) {

            if (form.$valid) {
                $scope.errors = [];
                OrangeApi.requested.post($scope.data).then(
                    function(response) {
                        console.log(response);
                        $scope.sent = true;
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
