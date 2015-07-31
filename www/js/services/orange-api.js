(function () {
    'use strict';

    angular
        .module('orange')
        .provider('OrangeApi', OrangeApi);

    OrangeApi.$inject = [];

    /* @ngInject */
    function OrangeApi() {
        var baseUrl = null;
        var clientSecret = null;
        var accessToken = null;

        return {
            setBaseUrl: function (url) {
                baseUrl = url;

            },
            setClientSecret: function(secret) {
                clientSecret = secret;
            },
            setAccessToken: function(token) {
                accessToken = token;
            },
            $get: ['Restangular', function (Restangular) {
                var OrangeRest = Restangular.withConfig(function (RestangularConfigurer) {

                    RestangularConfigurer.setBaseUrl(baseUrl);
                    RestangularConfigurer.setDefaultHeaders({
                        'X-Client-Secret': clientSecret,
                        'Authorization': accessToken
                    });
                    RestangularConfigurer.addRequestInterceptor(function(element) {
                        if (element.hasOwnProperty('success')) {
                            delete element['success']
                        }
                        return element;
                    });
                });

                function setAccessToken(token) {
                    var headers = OrangeRest.defaultHeaders;
                    accessToken = token;
                    headers['Authorization'] = 'Bearer ' + accessToken;
                    OrangeRest.setDefaultHeaders(headers);
                }

                return {
                    setAccessToken: setAccessToken,
                    auth: OrangeRest.all('auth'),
                    user: OrangeRest.all('user'),
                    requested: OrangeRest.all('requested'),
                    requests: OrangeRest.all('requests'),
                    patients: OrangeRest.all('patients'),
                    npi: OrangeRest.all('npi'),
                    rxnorm: OrangeRest.all('rxnorm')
                }
            }]
        }

    }
})();
