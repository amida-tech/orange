(function () {
    "use strict";

    angular
        .module('orange')
        .factory('Oauth', Oauth);

    Oauth.$inject = ['$q'];

    /* @ngInject */
    function Oauth($q) {

        return {
            smart: smart
        };

        ////////////////

        function smart(c) {
            var deferred = $q.defer();
            var requestToken = null;

            if (window.cordova) {
                var cordovaMetadata = cordova.require("cordova/plugin_list").metadata;
                if (isInAppBrowserInstalled(cordovaMetadata) === true) {
                    var redirect_uri = "http://localhost/callback";

                    var browserRef = window.open(c.auth_url +
                                                 c.credentials.authorization_path + '?client_id=' +
                                                 c.credentials.client_id + '&redirect_uri=' +
                                                 redirect_uri + '&response_type=code',
                                                 '_blank',
                                                 'location=no,clearsessioncache=yes,clearcache=yes');

                    browserRef.addEventListener('loadstart', function (event) {
                        console.log("loadstart: " + event.url);
                        if ((event.url).indexOf("/login?error=failure") > -1) {
                            deferred.reject("Login Failure");
                            browserRef.close();
                        }

                        if ((event.url).indexOf("http://localhost/callback") === 0) {
                            requestToken = (event.url).split("code=")[1];
                            console.log("code: " + requestToken);
                            deferred.resolve(requestToken);
                            browserRef.close();
                        }
                    });

                    browserRef.addEventListener('exit', function (event) {
                        deferred.reject("The sign in flow was canceled");
                    });

                } else {
                    deferred.reject("Could not find InAppBrowser plugin");
                }
            } else {
                deferred.reject("Cannot authenticate via a web browser");
            }
            return deferred.promise;
        }

        function isInAppBrowserInstalled(cordovaMetadata) {
            var inAppBrowserNames = ["cordova-plugin-inappbrowser", "org.apache.cordova.inappbrowser"];

            return inAppBrowserNames.some(function (name) {
                return cordovaMetadata.hasOwnProperty(name);
            });
        }
    }

})();
