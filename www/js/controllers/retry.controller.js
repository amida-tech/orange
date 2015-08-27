(function () {
    'use strict';

    angular
        .module('orange')
        .controller('RetryCtrl', RetryCtrl);

    RetryCtrl.$inject = [
        '$rootScope', '$state', '$ionicLoading', 'OrangeApi'
    ];

    function RetryCtrl($rootScope, $state, $ionicLoading, OrangeApi) {
        var vm = this;

        var methodsMap = {
            POST: 'post',
            GET: 'get',
            PUT: 'put',
            DELETE: 'delete'
        };

        if (!('parentResponse' in $rootScope)) {
            $state.go('onboarding');
            return;
        }

        vm.messageText = !$rootScope.parentResponse.status ? 'Connection Lost' : 'API not available yet.';
        vm.disabled = false;

        var url = $rootScope.parentResponse.config.url.replace(OrangeApi.rest.configuration.baseUrl, '');
        var method = methodsMap[$rootScope.parentResponse.config.method];
        var data = $rootScope.parentResponse.config.data;


        vm.retryEvent = function() {
            data = _.isUndefined(data) ? '' : data;
            vm.disabled = true;
            $ionicLoading.show({
               template: 'Retry...'
            });

            OrangeApi.rest.allUrl(url)[method](data).then(function(result) {
                $state.go($rootScope.currentState);
                delete $rootScope.currentState;
                return result;
            }, function(response) {
                if (response.status != 502 && response.status != 0) {
                    $state.go($rootScope.currentState);
                    delete $rootScope.currentState;
                }
            }).finally(function(res) {
                $ionicLoading.hide();
                vm.disabled = false;
            })
        }
    }
})();
