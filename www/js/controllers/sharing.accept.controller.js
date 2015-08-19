(function () {
    'use strict';

    angular
        .module('orange')
        .controller('SharingAcceptCtrl', SharingAcceptCtrl);

    SharingAcceptCtrl.$inject = ['$scope', '$state', 'LogService'];

    function SharingAcceptCtrl($scope, $state, LogService) {
        var vm = this;

        vm.accept = accept;

        LogService.getLogs().then(function (items) {
            vm.logs = items;
            vm.logList = _.chunk(items, 3);
        });

        function accept(acceptForm) {
            $state.go('app.sharing');
        }
    }
})();
