(function () {
    "use strict";

    angular
        .module('orange')
        .controller('MedicationsCtrl', MedicationsCtrl);

    MedicationsCtrl.$inject = ['OrangeApi', 'Oauth', 'TokenService'];

    /* @ngInject */
    function MedicationsCtrl(OrangeApi, Oauth, TokenService) {
        /* jshint validthis: true */
        var vm = this;

        vm.getSMARTToken = getSMARTToken;

        activate();

        ////////////////

        function activate() {
            console.log('here');
        }

        function getSMARTToken() {
            var c;
            vm.oauthError = "";
            TokenService.getSMARTCredentials(function (credentials) {
                c = credentials;
            });
            Oauth.smart(c).then(function (requestToken) {
                TokenService.getTokenResult(c, requestToken, function (err, result) {
                    if (err) {
                        console.log("error: " + err);
                        vm.oauthError = "error: " + err;
                    } else {
                        vm.oauthSuccess = "success " + JSON.stringify(result);
                        result.c = c;
                        result.patients = [{resource: {name: [{given: ['Daniel'], family: ['Adams']}]}}];
                        vm.token = result;
                        TokenService.setToken(result);
                        vm.tokenExists = true;
                        console.log(vm.token);
                    }
                })
            }, function (error) {
                console.log("error: " + error);
                vm.oauthError = "error " + error;
            });
        }
    }
})();
