(function () {
    "use strict";

    angular
        .module('orange')
        .constant('settings', {
            //'orangeApiUrl': 'http://orange-api.amida-demo.com/api/v1',
            'orangeApiUrl': 'http://orange-api.docker.arello-mobile.com/api/v1',
            'clientSecret': 'testsecret'
        });
})();
