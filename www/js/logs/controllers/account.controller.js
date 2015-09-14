(function () {
    "use strict";
    angular
        .module('orange')
        .controller('AccountCtrl', AccountCtrl);

    AccountCtrl.$inject = ['$rootScope', '$scope',  '$timeout', '$cordovaInAppBrowser', 'Auth', 'OrangeApi',
                           'PatientService', 'notifications'];

    /* @ngInject */
    function AccountCtrl($rootScope, $scope, $timeout, $cordovaInAppBrowser, Auth, OrangeApi, PatientService, notify) {

        $scope.login = login;
        $scope.signUp = signUp;
        $scope.goToTerms = goToTerms;
        $scope.error = false;
        $scope.errors = [];
        $scope.user = {};

        function signUp(form) {
            $scope.errors = [];
            if ($scope.user.agreement !== true) {
                $scope.errors.push('Please agree to the Terms of Use')
            }

            if (!form.$valid || $scope.errors.length) {
                $scope.error = true;
            } else {
                $scope.error = false;

                // Prepare User object
                var parts = $scope.user.fullName.split(' ');
                var first_name = parts.shift();
                var last_name = parts.join(' ');
                var user = {
                    'email': $scope.user.email,
                    'password': $scope.user.password,
                    'phone': $scope.user.phone || '',
                    'first_name': first_name,
                    'last_name': last_name
                };

                // Call Api
                OrangeApi.user.post(user).then(
                    function (response) {
                        Auth.auth(user).then(function (status) {
                            if (status === true) {
                                $scope.error = false;
                                $scope.errors = [];

                                PatientService.changeStateByPatient();
                                notify.updateNotify();
                            } else {
                                $scope.error = true;
                                $scope.errors = [];
                                $scope.errors.push('Invalid Email or Password')
                            }
                        })
                    },
                    function (error) {
                        $scope.error = true;
                        $scope.errors = _.map(error.data.errors, _.startCase);
                    }
                )
            }
        }

        function login(form) {
            $scope.errors = [];
            form.$submitted = true;
            if (form.$valid) {
                var user = {
                    'email': $scope.user.email,
                    'password': $scope.user.password
                };
                Auth.auth(user).then(function (status) {
                    $scope.errors = [];
                    form.$submitted = false;
                    PatientService.changeStateByPatient().then(function (response) {
                        $timeout(function () {
                            $scope.user = {};
                        }, 5000);
                        return response;
                    });
                    notify.updateNotify();
                }, function (error) {
                    form.$submitted = false;
                    var _error = error.data.errors[0];
                    if (_error === $rootScope.ERROR_LIST.WRONG_PASSWORD) {
                        $scope.errors = ['Incorrect Email or Password'];
                    } else if (_error === $rootScope.ERROR_LIST.LOGIN_ATTEMPTS_EXCEEDED) {
                        $scope.errors = ['Too many incorrect tries'];
                    } else {
                        $scope.errors = [_.startCase(_error)];
                    }
                });
            }

            $scope.$watch('user.email', function () {
                if ($scope.errors.length) {
                    $scope.errors = [];
                }
            });

            $scope.$watch('user.password', function () {
                if ($scope.errors.length) {
                    $scope.errors = [];
                }
            });
        }

        function goToTerms() {
            $cordovaInAppBrowser.open('http://amida-tech.github.io/orange/terms', '_blank');
        }
    }
})();
