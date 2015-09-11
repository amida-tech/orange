(function () {
    'use strict';

    angular
        .module('orange')
        .service('GlobalService', GlobalService);

    GlobalService.$inject = ['$q', '$ionicPopup'];

    /* @ngInject */
    function GlobalService($q, $ionicPopup) {
        var service = {
                showError: showError,
                showConfirm: showConfirm
            },
            isShowError = false;

        return service;

        function showError(description, title) {
            if (!isShowError) {
                isShowError = true;
                return $ionicPopup.alert({
                    title: title || 'Error',
                    template: description || 'Error',
                    okType: 'button-dark-orange'
                }).then(function () {
                    isShowError = false;
                });
            } else {
                var deferred = $q.defer();
                deferred.reject(null);
                return deferred.promise;
            }
        }

        function showConfirm(description, title, scope) {
            if (!isShowError) {
                return $ionicPopup.confirm({
                    title: title || 'Confirm',
                    template: description || 'Are you sure to perform the action?',
                    okType: 'button-dark-orange',
                    okText: 'Yes',
                    cancelText: 'No',
                    scope: scope
                });
            } else {
                var deferred = $q.defer();
                deferred.reject(null);
                return deferred.promise;
            }
        }
    }
})();
