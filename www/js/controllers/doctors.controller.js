(function () {
    'use strict';

    angular
        .module('orange')
        .controller('DoctorsCtrl', DoctorsCtrl);

    DoctorsCtrl.$inject = ['$scope', 'OrangeApi'];

    /* @ngInject */
    function DoctorsCtrl($scope, OrangeApi) {
        $scope.doctors = []
    }
})();
