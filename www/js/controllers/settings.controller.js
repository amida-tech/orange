(function () {
    "use strict";

    angular
        .module('orange')
        .controller('SettingsCtrl', SettingsCtrl);

    SettingsCtrl.$inject = ['$state', '$ionicPopup', 'Auth'];

    /* @ngInject */
    function SettingsCtrl($state, $ionicPopup, Auth) {
        /* jshint validthis: true */
        var vm = this;

        vm.title = 'Settings';
        vm.logout = logout;

        ////////////////


        function logout() {
            $ionicPopup.confirm({
                title: 'Sign Out',
                template: '<p class="text-center">Are you sure you want sign out?</p>',
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
