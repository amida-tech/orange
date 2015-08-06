(function () {
    "use strict";

    angular
        .module('orange')
        .controller('MenuCtrl', MenuCtrl);

    MenuCtrl.$inject = ['$scope', 'Auth', 'Patient', 'log'];

    /* @ngInject */
    function MenuCtrl($scope, Auth, Patient, log) {
        $scope.profile = Auth.userInfo();
        $scope.log = log;
        Patient.set(log.id);
    }
})();
