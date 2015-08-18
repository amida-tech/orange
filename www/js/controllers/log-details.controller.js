(function () {
    'use strict';

    angular
        .module('orange')
        .controller('LogDetailsCtrl', LogDetailsCtrl);

    LogDetailsCtrl.$inject = ['$scope', '$stateParams', 'OrangeApi'];

    function LogDetailsCtrl($scope, $stateParams, OrangeApi) {

        var vm = this;

        OrangeApi.patients.get($stateParams.id).then(function (item) {
            vm.currentLog = item;
            item.one('habits').get('').then(function (habits) {
                vm.habits = habits;
            });
            vm.title = item.first_name + ' ' + item.last_name;
        });
    }
})();
