(function () {
    'use strict';

    angular
        .module('orange')
        .service('Auth', Auth);

    Auth.$inject = ['$rootScope', '$q', '$timeout', 'OrangeApi', '$localstorage'];

    /* @ngInject */
    function Auth($rootScope, $q, $timeout, OrangeApi, $localstorage) {
        var user = null;
        var authorized = null;

        return {
            auth: auth,
            init: init,
            logout: logout,
            userInfo: userInfo,
            isAuthorized: isAuthorized
        };

        function isAuthorized() {
            return authorized;
        }

        function userInfo() {
            return user;
        }

        function init() {

            var deffered = $q.defer();

            if (authorized !== null) {
                deffered.resolve(authorized);
                return deffered.promise;
            }
            // try to retrieve access token from local storage
            var token = $localstorage.get('ACCESS_TOKEN', null);

            if (token) {
                // configure orange api
                OrangeApi.setAccessToken(token);

                // retrieve user information
                getUserInfo(deffered);

            } else {
                authorized = false;
                $timeout(function() {
                    deffered.resolve(false);
                }, 400);

            }
            return deffered.promise;
        }

        function logout() {
            user = null;
            authorized = false;
            $localstorage.remove('ACCESS_TOKEN');
            $rootScope.$broadcast('auth:user:logout');
        }

        function getUserInfo(d) {
            OrangeApi.user.get('').then(
                function (response) {
                    if (response.success) {
                        user = response.plain();
                        authorized = true;
                        $rootScope.$broadcast('auth:user:authorized');
                        d.resolve(true);
                    } else {
                        logout();
                        d.resolve(false);
                    }
                },
                function () {
                    logout();
                    d.resolve(false);
                });
        }

        function auth(user) {
            var deffered = $q.defer();

            OrangeApi.auth.all('token').post(user).then(
                function (response) {
                    if (response.success) {
                        // save access token to localstorage
                        $localstorage.set('ACCESS_TOKEN', response.access_token);
                        OrangeApi.setAccessToken(response.access_token);
                        // retrieve user info
                        getUserInfo(deffered)
                    } else {
                        logout();
                        deffered.resolve(false);
                    }
                },
                function () {
                    logout();
                    deffered.resolve(false);
                }
            );
            return deffered.promise;

        }
    }
})();
