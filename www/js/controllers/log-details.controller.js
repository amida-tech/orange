(function () {
    'use strict';

    angular
        .module('orange')
        .controller('LogDetailsCtrl', LogDetailsCtrl);

    LogDetailsCtrl.$inject = ['$scope', '$stateParams', 'OrangeApi'];

    function LogDetailsCtrl($scope, $stateParams, OrangeApi) {

        OrangeApi.patients.get($stateParams.id).then(function (item) {
            $scope.log = item;
            $scope.habits = item.one('habits').get('');
            $scope.title = item.first_name + ' ' + item.last_name;
        });
    }
})();
