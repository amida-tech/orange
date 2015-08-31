(function () {
    "use strict";

    angular
        .module('orange')
        .controller('MenuCtrl', MenuCtrl);

    MenuCtrl.$inject = ['$scope', '$timeout', '$state', 'Auth', 'patient', '$ionicHistory'];

    /* @ngInject */
    function MenuCtrl($scope, $timeout, $state, Auth, patient, $ionicHistory) {
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
