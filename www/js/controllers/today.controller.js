(function () {
    'use strict';

    angular
        .module('orange')
        .controller('TodayCtrl', TodayCtrl);

    TodayCtrl.$inject = ['$scope', '$timeout', 'Auth'];

    function TodayCtrl($scope, $timeout, Auth) {
        $scope.refresh = function () {
            $timeout(function () {
                console.log('Rerfreshed');
                $scope.$broadcast('scroll.refreshComplete');
            }, 2000);
        };

        $scope.doLogin = function () {
            console.log(Auth.isAuthorized());
            console.log(Auth.userInfo());
        };
    }
})();
