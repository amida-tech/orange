(function () {
    'use strict';

    angular
        .module('orange')
        .controller('SharingCtrl', SharingCtrl);

    SharingCtrl.$inject = ['$scope', '$locale', 'OrangeApi', 'LogService'];

    function SharingCtrl($scope, $locale, OrangeApi, LogService) {
        var vm = this;

        vm.months = $locale.DATETIME_FORMATS.MONTH;

        OrangeApi.requested.getList().then(function (items) {
            vm.requested = items;
        });
        OrangeApi.requests.getList().then(function (items) {
            vm.requests = items
        });
    }
})();
