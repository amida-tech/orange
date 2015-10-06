(function () {
    "use strict";

    angular
        .module('orange')
        .controller('SettingsCtrl', SettingsCtrl);

    SettingsCtrl.$inject = ['$scope', '$timeout', '$state', '$ionicPopup', '$ionicLoading', 'Auth', 'OrangeApi'];

    /* @ngInject */
    function SettingsCtrl($scope, $timeout, $state, $ionicPopup, $ionicLoading, Auth) {
        /* jshint validthis: true */
        var vm = this;
        var user = Auth.userInfo();

        //Form objects
        $scope.accountUpdate = {};
        $scope.passwordReset = {};


        vm.success = false;
        vm.timer = null;
        vm.title = 'Settings';
        vm.logout = logout;
        vm.email = user.email;

        vm.user_model = {
            full_name: user.first_name + ' ' + user.last_name,
            phone: user.phone
        };

        vm.password_model = {
            old: '',
            new: '',
            confirm: ''
        };

        ////////////////

        //Set form to controller object
        vm.setFormScope = function(scope) {
            vm.formScope = scope
        };

       function validateAccountForm(resetPasswordError) {
            vm.formScope.accountUpdate.$submitted = true;
            return !_.isEmpty(vm.formScope.accountUpdate.$error) || resetPasswordError
       }

       function validateResetPasswordForm() {
            vm.formScope.passwordReset.$submitted = true;
            return !_.isEmpty(vm.formScope.passwordReset.$error);
       }


        vm.update = function() {
            var resetPasswordError = false; //Flag - password form has error
            var withPassword = false; //Flag - update user with password

            //Action on reset password
            if (vm.password_model.old != '') {
                var alert = false;
                withPassword = true;

                //Check current password
                Auth.checkPassword(vm.password_model.old).then(function(response) {}, function() {
                    alert = $ionicPopup.alert({ title: 'Invalid Current Password.' });
                    resetPasswordError = true;
                }).finally(function() {
                    //Check `resetPassword` form
                    if (!resetPasswordError) {
                        resetPasswordError = validateResetPasswordForm();
                    }

                    //Check `updateAccount` form
                    if (validateAccountForm(resetPasswordError)) {
                        return;
                    }

                    updateProcess(withPassword)
                });

                return;
            }


            //Check `resetPassword` form
            if (vm.password_model.new != '' || vm.password_model.confirm != '') {
                resetPasswordError = validateResetPasswordForm();
            }

            //Check `updateAccount` form
            if (validateAccountForm(resetPasswordError)) {
                return;
            }

            updateProcess(withPassword);
        };

        function updateProcess(withPassword) {
            //Build User object
            var parts = vm.user_model.full_name.split(' ');
            var first_name = parts.shift();
            var last_name = parts.join(' ');

            var user = {
                'phone': vm.user_model.phone || '',
                'first_name': first_name,
                'last_name': last_name
            };

            if (withPassword) {
                user.password = vm.password_model.new;
            }

            $ionicLoading.show({
                template: 'Updating Account...'
            });

            //Update user
            Auth.update(user).finally(function() {
                $ionicLoading.hide();
                vm.success = true;
                if (vm.timer) {
                    $timeout.cancel(vm.timer);
                    vm.timer = null;
                }
                vm.timer = $timeout(function() {
                    vm.success = false;
                }, 3000);
                //Reset `resetPassword` form
                vm.formScope.passwordReset.$submitted = false;
                vm.password_model = {
                    old: '',
                    new: '',
                    confirm: ''
                };

            })
        }

        function logout() {
            $ionicPopup.confirm({
                title: 'Sign Out',
                template: '<p class="text-center">Are you sure you want to sign out?</p>',
                okText: '<b>Yes</b>',
                okType: 'button-dark-orange'
            }).then(
                function (confirm) {
                    if (confirm) {
                        Auth.logout();
                        $state.go('onboarding');
                    }
                });
        }
    }
})();
