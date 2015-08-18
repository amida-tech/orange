(function () {
    'use strict';

    angular
        .module('orange')
        .controller('LogDetailsCtrl', LogDetailsCtrl);

    LogDetailsCtrl.$inject = ['$scope', '$stateParams', 'LogService'];

    function LogDetailsCtrl($scope, $stateParams, LogService) {

        var vm = this;

        vm.currentLog = null;

        LogService.setDetailLog($stateParams.id).then(function (item) {
            vm.currentLog = item;
            vm.title = item.first_name + ' ' + item.last_name;
        });
    }
})();
