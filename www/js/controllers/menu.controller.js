(function () {
    "use strict";

    angular
        .module('orange')
        .controller('MenuCtrl', MenuCtrl);

    MenuCtrl.$inject = ['$scope', '$state', 'Auth', 'patient', '$ionicHistory', '$timeout'];

    /* @ngInject */
    function MenuCtrl($scope, $state, Auth, patient, $ionicHistory, $timeout) {
        $scope.profile = Auth.userInfo();
        $scope.log = patient;
        $scope.patient = patient;
        if (patient == null) {
            $state.go('logs')
        }

        $scope.fixHistory = function() {
            $timeout( function() {
                $ionicHistory.nextViewOptions({
                    historyRoot: false,
                    disableAnimate: false
                });
            }, 300);
        }
    }
})();
