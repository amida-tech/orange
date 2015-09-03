(function () {
    "use strict";

    angular
        .module('orange')
        .controller('MenuCtrl', MenuCtrl);

    MenuCtrl.$inject = ['$scope', '$state', 'Auth', 'patient'];

    function MenuCtrl($scope, $state, Auth, patient) {
        $scope.profile = Auth.userInfo();
        $scope.log = patient;
        $scope.patient = patient;
        if (patient === null) {
            $state.go('logs')
        }
    }
})();
