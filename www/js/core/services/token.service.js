(function () {
    "use strict";

    angular
        .module('orange')
        .factory('TokenService', TokenService);

    TokenService.$inject = ['$localstorage', '$http'];

    /* @ngInject */
    function TokenService($localstorage, $http) {
        return {
            getTokens: getTokens,
            getToken: getToken,
            setToken: setToken,
            setTokens: setTokens,
            clearTokens: clearTokens,
            tokenExists: tokenExists,
            getDRECredentials: getDRECredentials,
            getTokenResult: getTokenResult,
            getSMARTCredentials: getSMARTCredentials,
            getPatients: getPatients,
            getMedications: getMedications,
            getUserMedications: getUserMedications
        };

        ////////////////

        function getTokens(callback) {
            var userTokens = $localstorage.getObject('userTokens');
            if (userTokens.hasOwnProperty("tokens")) {
                callback(userTokens.tokens);
            } else {
                callback([]);
            }
        }

        function getToken(callback) {
            callback($localstorage.getObject('userToken'));
        }

        function setToken(token) {
            $localstorage.setObject('userToken', token);
        }

        function setTokens(tokens) {
            var userTokens = {tokens: tokens};
            $localstorage.setObject('userTokens', userTokens);
        }

        function clearTokens() {
            var userTokens = {tokens: []};
            $localstorage.setObject('userTokens', userTokens);
            $localstorage.setObject('userToken', {});
        }

        function tokenExists() {
            var token = $localstorage.getObject('userToken', {});
            return Object.keys(token).length !== 0;
        }

        /*function getDRECredentials(callback) {
            var c = {
                name: 'DRE/FHIR',
                url: 'http://dre.amida-demo.com:3000/',
                auth_url: 'http://dre.amida-demo.com:3000/',
                logo_url: '',
                credentials: {
                    client_id: 'argonaut_demo_client_local',
                    client_secret: 'have no secrets!',
                    site: 'http://dre.amida-demo.com:3000/',
                    api_url: 'http://dre.amida-demo.com:3000/fhir',
                    authorization_path: 'oauth2/authorize',
                    token_path: 'oauth2/token',
                    revocation_path: 'oauth2/revoke',
                    scope: '',
                    redirect_uri: 'http://localhost/callback'
                }
            };
            callback(c);
        }*/
        
        function getDRECredentials(callback) {
            var c = {
                name: 'DRE/FHIR',
                url: 'http://dre2.amida-demo.com:3001/',
                auth_url: 'http://dre2.amida-demo.com:3001/',
                logo_url: '',
                credentials: {
                    client_id: 'argonaut_demo_client_local',
                    client_secret: 'have no secrets!',
                    site: 'http://dre2.amida-demo.com:3001/',
                    api_url: 'http://dre2.amida-demo.com:3001/api/v1/storage/fhir',
                    authorization_path: 'oauth2/authorize',
                    token_path: 'oauth2/token',
                    revocation_path: 'oauth2/revoke',
                    scope: '',
                    redirect_uri: 'http://localhost/callback'
                }
            };
            callback(c);
        }

        function getTokenResult(c, requestToken, callback) {
            var redirect_uri = "http://localhost/callback";
            //$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
            $http({
                method: "post",
                url: c.auth_url + c.credentials.token_path,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                auth: {
                    user: c.credentials.client_id,
                    pass: c.credentials.client_secret,
                    sendImmediately: true
                },
                data: "client_id=" + c.credentials.client_id + "&client_secret=" + c.credentials.client_secret + "&redirect_uri=" + redirect_uri + "&grant_type=authorization_code" + "&code=" + requestToken,
                form: {
                    code: requestToken,
                    redirect_uri: redirect_uri,
                    client_id: c.credentials.client_id,
                    client_secret: c.credentials.client_secret,
                    grant_type: 'authorization_code'
                }
            })
                .success(function (data) {
                             console.log("getDREResult: ", data);
                             callback(null, data);
                         })
                .error(function (data, status) {
                           console.log("getDREResult error: ", data);
                           callback("Problem Authenticating");
                       })
        }


        function getSMARTCredentials(callback) {
            var c = {
                name: 'SMART on FHIR',
                url: 'https://fhir-api.smarthealthit.org/',
                auth_url: 'https://authorize.smarthealthit.org/',
                logo_url: '',
                credentials: {
                    client_id: '89032ea9-ca63-45fc-a4a9-c41e5d0a5fe4',
                    client_secret: 'ALsLobPCcQFrDCwzJ-eC_puhIPTFeEP6eSz6cj07DNSvWN9mM2nCmxW4hlxwOu9xB8s92BeCbx_eh9nRvZ3lioQ',
                    site: 'https://authorize.smarthealthit.org/',
                    api_url: 'https://fhir-api.smarthealthit.org',
                    authorization_path: '/authorize',
                    token_path: '/token',
                    revocation_path: '/revoke',
                    scope: 'launch/patient',
                    redirect_uri: 'http://localhost/callback'
                }
            };
            callback(c);
        }


        function getPatients(token, callback) {
            $http({
                method: "get",
                url: token.c.credentials.api_url + '/Patient',
                headers: {
                    Authorization: 'Bearer ' + token.access_token,
                    Accept: 'application/json'
                }
            })
                .success(function (data) {
                             callback(data);
                         })
                .error(function (data, status) {
                           callback(status);
                       })
        }


        function getMedications(token, patient, callback) {
            $http({
                method: "get",
                url: token.c.credentials.api_url + '/MedicationOrder?patient=' + patient,
                headers: {
                    Authorization: 'Bearer ' + token.access_token,
                    Accept: 'application/json'
                }
            })
                .success(function (data) {
                             callback(data);
                         })
                .error(function (data, status) {
                           callback(status);
                       })
        }


        function getUserMedications(callback) {
            getToken(function (token) {
                getPatients(token, function(patients) {
                    //console.log('Received patients: ', JSON.stringify( patients,null,4));

                    //Pick first patient for now
                    var patient = patients && patients.entry && patients.entry.length ? patients.entry[0] : null;
                    if (patient) {
                        console.log("Patient: "+ JSON.stringify(patient,null,4));
                        var patientID = patient.resource.id;
                        var splitted = patientID.split("/");
                        patientID=splitted[splitted.length-1]; // Rightmost element
                        console.log("patientID: ", patientID);
                        var medUrl = token.c.credentials.api_url + '/MedicationOrder?patient=' + patientID + '&_include=MedicationOrder%3Amedication';
                        $http({
                            method: "get",
                            url: medUrl,
                            headers: {
                                Authorization: 'Bearer ' + token.access_token,
                                Accept: 'application/json'
                            }
                        })
                            .success(function (data) {


                                         console.log("was successful connection to meds: ", JSON.stringify(data,null,4));
                                         callback(data);
                                     })
                            .error(function (data, status) {
                                       console.log("error connecting to meds: " + data + " - " + status);
                                       callback(status);
                                   })
                    } else {
                        callback(404);
                    }
                });
            });
        }
    }
})();
