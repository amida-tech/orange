(function() {
    'use strict';

    angular
        .module('orange')
        .controller('ComponentsCtrl', ComponentsCtrl);

    ComponentsCtrl.$inject = ['$scope'];
    function ComponentsCtrl($scope) {
        $scope.b1 = 3;
        $scope.b2 = 2;
        $scope.b3 = 1;
        $scope.wd = 2;
    }
})();
