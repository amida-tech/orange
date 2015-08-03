(function () {
    'use strict';

    angular
        .module('orange')
        .controller('TodayCtrl', TodayCtrl);

    TodayCtrl.$inject = ['$scope', '$timeout', 'OrangeApi', 'Patient'];

    function TodayCtrl($scope, $timeout, OrangeApi, Patient) {
        $scope.refresh = function () {
            $timeout(function () {
                console.log('Rerfreshed');
                $scope.$broadcast('scroll.refreshComplete');
            }, 2000);
        };

        Patient.set(9);

        $scope.doLogin = function () {
            var doctor = {
                "search": {
                    "name": [
                        {
                            "first": "John",
                            "last": "Smith"
                        }
                    ],
                    "address": [
                        {
                            "state": "CA"
                        }
                    ]
                }
            };

            var medication = {
                medname: 'aspirin'
            };

            Patient.api('journal').get('').then(
                function(data) {
                    console.log(data.plain());
                },
                function(response) {
                    console.log(response);
                }
            );

            //OrangeApi.patients.getList().then(
            //    function (patients) {
            //        console.log(patients.plain());
            //    },
            //    function (response) {
            //        console.log(response);
            //    }
            //);
            //OrangeApi.rxnorm.spelling.post(medication).then(
            //    function(result) {
            //        console.log(result.plain());
            //    },
            //    function(response) {
            //        console.log(response);
            //    }
            //)
        }
    }
})();
