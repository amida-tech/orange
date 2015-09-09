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
            setClientSecret: function (secret) {
                clientSecret = secret;
            },
            setAccessToken: function (token) {
                accessToken = token;
            },
            $get: ['Restangular', '$state', '$rootScope', '$ionicLoading', '$injector', 'GlobalService',
                function (Restangular, $state, $rootScope, $ionicLoading, $injector, GlobalService) {

                var OrangeRest = Restangular.withConfig(function (RestangularConfigurer) {

                    RestangularConfigurer.setBaseUrl(baseUrl);
                    RestangularConfigurer.setDefaultHttpFields({cache: false});
                    RestangularConfigurer.setDefaultHeaders({
                        'X-Client-Secret': clientSecret,
                        'Authorization': 'Bearer ' + accessToken
                    });
                    RestangularConfigurer.setDefaultHttpFields({timeout: 30 * 1000});

                    RestangularConfigurer.addRequestInterceptor(function (element) {
                        if (element && element.hasOwnProperty('success')) {
                            delete element['success']
                        }
                        return element;
                    });

                    RestangularConfigurer.addResponseInterceptor(function (data, operation, what, url, response, deferred) {
                        var extractedData = function(obj, key) {
                            var ret;
                            ret = obj[key];
                            delete obj[key];
                            ret.meta = obj;
                            return ret
                        };

                        if (operation == 'getList') {

                            if (data.hasOwnProperty(what)) {
                                return extractedData(data, what)
                            } else if  (data.hasOwnProperty('entries')) {
                                return extractedData(data, 'entries')
                            }

                            return data
                        }

                        return data;
                    });

                    RestangularConfigurer.setErrorInterceptor(function (response, deferred, responseHandler) {
                        switch (response.status) {
                            case 500:
                                $ionicLoading.hide();
                                GlobalService.showError('Server Error');
                                return false;

                            case 401:
                                if (response.data.errors[0] !== $rootScope.ERROR_LIST.WRONG_PASSWORD) {
                                    $ionicLoading.hide();
                                    GlobalService.showError('Authorization is failed').then(function () {
                                        var authService = $injector.get('Auth');
                                        authService.logout();
                                        $state.go('onboarding');
                                    });
                                    return false;
                                }
                                break;

                            default:

                                if (response.status == 502 || !response.status) {
                                    $ionicLoading.hide();
                                    $rootScope.parentResponse = response;
                                    $rootScope.promise = deferred;

                                    if (_.isUndefined($rootScope.currentState))
                                        $rootScope.currentState = $state.current.name;

                                    $state.go('retry');
                                    return false;
                                }
                        }

                        return true;
                    })
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
                    rxnorm: {
                        search: OrangeRest.all('rxnorm').all('group'),
                        spelling: OrangeRest.all('rxnorm').all('spelling')
                    },
                    rest: OrangeRest
                }
            }]
        }

    }
})();
