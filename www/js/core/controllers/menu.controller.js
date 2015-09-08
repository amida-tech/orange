(function () {
    "use strict";

    angular
        .module('orange')
        .controller('MenuCtrl', MenuCtrl);

    MenuCtrl.$inject = ['$scope', '$state', 'Auth', 'PatientService'];

    function MenuCtrl($scope, $state, Auth, PatientService) {
        $scope.profile = Auth.userInfo();
        PatientService.getPatient().then(function (patient) {
            $scope.log = patient;
            if (patient === null) {
                $state.go('logs')
            }
        });
    }
})();
