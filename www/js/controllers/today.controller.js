(function () {
    'use strict';

    angular
        .module('orange')
        .controller('TodayCtrl', TodayCtrl);

    TodayCtrl.$inject = ['$scope', '$timeout', 'OrangeApi', 'log'];

    function TodayCtrl($scope, $timeout, OrangeApi, log) {
        $scope.refresh = function () {
            $timeout(function () {
                console.log('Rerfreshed');
                $scope.$broadcast('scroll.refreshComplete');
            }, 2000);
        };

        $scope.doLogin = function () {


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
