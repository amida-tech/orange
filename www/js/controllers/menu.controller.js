(function () {
    "use strict";

    angular
        .module('orange')
        .controller('MenuCtrl', MenuCtrl);

    MenuCtrl.$inject = ['$scope', 'Auth'];

    /* @ngInject */
    function MenuCtrl($scope, Auth) {
        $scope.profile = Auth.userInfo();
    }
})();
