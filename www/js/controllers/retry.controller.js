(function () {
    'use strict';

    angular
        .module('orange')
        .controller('RetryCtrl', RetryCtrl);

    RetryCtrl.$inject = [
        '$rootScope', 'OrangeApi', '$state', '$http'
    ];

    function RetryCtrl($rootScope, OrangeApi, $state, $http) {
        var vm = this;

        var methodsMap = {
            POST: 'post',
            GET: 'get',
            PUT: 'put'
        };

        if (!('parentResponse' in $rootScope)) {
            $state.go('onboarding');
        }

        vm.messageText = !$rootScope.parentResponse.status ? 'Connection Lost' : 'API not available yet.';

        var url = $rootScope.parentResponse.config.url.replace(OrangeApi.rest.configuration.baseUrl, '');
        var method = methodsMap[$rootScope.parentResponse.config.method];
        var data = $rootScope.parentResponse.config.data;


        vm.retryEvent = function() {
            data = _.isUndefined(data) ? '' : data;
            OrangeApi.rest.allUrl(url)[method](data).then(function(result) {
                $state.go($rootScope.currentState);
                delete $rootScope.currentState;
                return result;
            }, $rootScope.promise.reject)
        }
    }
})();