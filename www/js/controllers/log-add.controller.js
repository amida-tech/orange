(function () {
    "use strict";

    angular
        .module('orange')
        .controller('AddLogCtrl', AddLogCtrl);

    AddLogCtrl.$inject = ['$scope', '$state', 'OrangeApi', 'log'];

    /* @ngInject */
    function AddLogCtrl($scope, $state, OrangeApi, log) {

        $scope.log = log;
        $scope.saveLog = saveLog;
        $scope.isDevice = ionic.Platform.isWebView();
        $scope.title = log.me ? 'Add My Log': 'Add New Log';

        function saveLog() {

            if ($scope.log.restangularized) {
                // Restangular object
                // We can just save changes
                $scope.log.birthdate = $scope.log.birthdate || null;
                if ($scope.log.birthdate instanceof Date) {
                    $scope.log.birthdate = $scope.log.birthdate.toJSON().slice(0, 10);
                 }
                $scope.log.save().then(
                    function (patient) {
                        $scope.log = patient;
                        $state.go('logs')
                    },
                    function (response) {
                        alert(response.data.errors);
                    }
                )
            } else {
                // Not restangular object
                // Create new patient
                var parts = $scope.log.fullName ? $scope.log.fullName.split(' ') : [];
                $scope.log.first_name = parts.shift() || '';
                $scope.log.last_name = parts.shift() || '';

                OrangeApi.patients.post($scope.log).then(
                    function(patient) {
                        $scope.log = patient;
                        $scope.log.fullName = $scope.log.first_name + ' ' + $scope.log.last_name;
                        $state.go('logs');
                    },
                    function(error) {
                        alert(error.status);
                    }
                )
            }
        }
    }
})();
