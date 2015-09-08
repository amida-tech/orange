(function () {
    'use strict';

    angular
        .module('orange')
        .factory('RequestsService', RequestsService);

    RequestsService.$inject = ['$q', '$rootScope', 'OrangeApi'];

    function RequestsService($q, $rootScope, OrangeApi) {
        var vm = this,
            service = {
                acceptRequest: acceptRequest,
                cancelRequested: cancelRequested,
                declineRequest: declineRequest,
                getRequested: getRequested,
                getRequests: getRequests,
                getAcceptingRequest: getAcceptingRequest,
                setAcceptingRequest: setAcceptingRequest
            };

        vm.requested = null;
        vm.requests = null;
        vm.acceptingRequest = null;

        $rootScope.$on('auth:user:logout', function () {
            vm.requested = null;
            vm.requests = null;
        });

        return service;

        function getRequested(force) {
            force = force || false;
            var deferred = $q.defer();
            if (vm.requested !== null && !force) {
                deferred.resolve(vm.requested);
                return deferred.promise;
            } else {
                return OrangeApi.requested.getList().then(
                    function (requests) {
                        vm.requested = requests;
                        return requests;
                    }
                )
            }
        }

        function getRequests(force) {
            var deferred = $q.defer();
            if (vm.requests !== null && !force) {
                deferred.resolve(vm.requests);
                return deferred.promise;
            } else {
                return OrangeApi.requests.getList({status: 'pending'}).then(
                    function (requests) {
                        vm.requests = requests;
                        return requests;
                    }
                )
            }
        }

        function cancelRequested(request) {
            return request.remove().then(
                function () {
                    request.status = 'cancelled';
                }
            );
        }

        function acceptRequest(request) {
            return removeRequest(request, 'accepted');
        }

        function declineRequest(request) {
            return removeRequest(request, 'rejected');
        }

        function removeRequest(request, status) {
            // status must be in query body
            var requestIndex = vm.requests.indexOf(request);
            return OrangeApi.requests.customOperation(
                'remove',
                request.id,
                undefined,
                {'Content-Type': 'application/json'},
                {status: status}
            ).then(
                function () {
                    if (requestIndex > -1) {
                        vm.requests.splice(requestIndex, 1);
                    }
                }
            )
        }

        function setAcceptingRequest(request) {
            vm.acceptingRequest = request;
        }

        function getAcceptingRequest() {
            return vm.acceptingRequest;
        }
    }
})();
