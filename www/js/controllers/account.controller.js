(function () {
    "use strict";
    angular
        .module('orange')
        .controller('AccountCtrl', AccountCtrl);

    AccountCtrl.$inject = ['$scope', '$state', 'Auth', 'OrangeApi'];

    /* @ngInject */
    function AccountCtrl($scope, $state, Auth, OrangeApi) {

        $scope.login = login;
        $scope.signUp = signUp;
        $scope.error = false;
        $scope.errors = [];
        $scope.user = {
            'fullName': 'John Doe',
            'email': 'fooo@example.com',
            'phone': '+8 322 23442',
            'password': '123qwe',
            'confirmPassword': '123qwe',
            agreement: true

        };

        function signUp(form) {
            $scope.errors = [];
            if ($scope.user.agreement === false) {
                $scope.errors.push('You must agree to the Terms of User')
            }

            if (!form.$valid || $scope.errors.length) {
                $scope.error = true;
            } else {
                $scope.error = false;

                // Prepare User object
                var parts = $scope.user.fullName.split(' ');
                var first_name = parts.shift();
                var last_name = parts.shift() || '';
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
                        console.log(response.plain());
                    },
                    function (error) {
                        $scope.error = true;
                        error.data.errors.forEach(function (elem) {
                            $scope.errors.push(_.startCase(elem))
                        });

                    }
                )
            }
        }

        function login(form) {
            $scope.errors = [];
            if (!form.$valid || $scope.errors.length) {
                $scope.error = true;
            } else {
                var user = {
                    'email': $scope.user.email,
                    'password': $scope.user.password
                };
                Auth.auth(user).then(function (status) {
                    if (status === true) {
                        $scope.error = false;
                        $scope.errors = [];
                        $state.go('app.today');
                    } else {
                        $scope.error = true;
                        $scope.errors = [];
                        $scope.errors.push('Invalid Email or Password')
                    }
                })
            }
        }
    }
})();
