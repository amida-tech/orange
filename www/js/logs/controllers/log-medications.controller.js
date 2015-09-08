(function () {
    "use strict";

    angular
        .module('orange')
        .controller('LogMedicationsCtrl', LogMedicationsCtrl);

    LogMedicationsCtrl.$inject = [
        '$scope',
        '$q',
        '$state',
        '$ionicLoading',
        'TokenService',
        'Oauth',
        'patient',
        'medications'
    ];

    /* @ngInject */
    function LogMedicationsCtrl($scope, $q, $state, $ionicLoading, TokenService, Oauth, patient, medications) {
        /* jshint validthis: true */
        var vm = this;

        vm.importComplete = false;
        vm.hasImported = false;
        vm.medications = null;
        vm.medication = null;
        vm.log = patient;


        vm.pickMedication = pickMedication;
        vm.getSMARTToken = getSMARTToken;
        vm.editMedication = editMedication;

        activate();

        //////////////////////

        function activate() {
            console.log('LogMedicationsCtrl activated');
            medications.setLog(patient);
            refresh();
            $scope.$watch(medications.getMedications, function (medications) {
                console.log('Medications Changed', medications);
                if (medications !== vm.medications) {
                    update(medications);
                }
            });

            $scope.$watch(medications.getMedication, function (medication) {

                if (medication !== vm.medication) {
                    console.log('Medication changed', medication);
                    vm.medication = medication;
                    vm.eventsText = getMedicationText(medication);
                }
            });
        }

        function prepareMedication(medication) {
            return {
                name: medication.name,
                brand: '',
                origin: 'imported',
                import_id: medication.code,
                dose: {
                    quantity: 1,
                    unit: 'mg'
                },
                access_prime: 'write',
                access_family: 'write',
                access_anyone: 'write'
            }
        }

        function getMedications(val) {
            var result = [];
            if (val && val.entry) {
                var i, len = val.entry.length;
                for (i = 0; i < len; i++) {
                    var content = val.entry[i].content || val.entry[i].resource;
                    if (content && content.resourceType === 'MedicationPrescription') {
                        var contained = content.contained;
                        if (contained && contained.length > 0) {
                            var j, len2 = contained.length;
                            for (j = 0; j < len2; j++) {
                                var item = contained[j];
                                var med = {
                                    name: item.name,
                                    status: content.status
                                };
                                if (item.code && item.code.coding.length && item.code.coding[0].code) {
                                    med.code = parseInt(item.code.coding[0].code);
                                }
                                result.push(prepareMedication(med));
                            }
                        }
                    }
                }
            }
            return result;
        }

        function getSMARTToken() {
            var c;
            vm.oauthError = "";
            $ionicLoading.show({
                template: 'Loading...'
            });
            TokenService.getSMARTCredentials(function (credentials) {
                c = credentials;
            });
            Oauth.smart(c).then(function (requestToken) {
                TokenService.getTokenResult(c, requestToken, function (err, result) {
                    if (err) {
                        console.log("error: " + err);
                        vm.oauthError = "error: " + err;
                        $ionicLoading.hide();
                    } else {
                        vm.oauthSuccess = "success " + JSON.stringify(result);
                        result.c = c;
                        //result.patients = [{resource: {name: [{given: ['Daniel'], family: ['Adams']}]}}];
                        vm.token = result;
                        TokenService.setToken(result);
                        vm.tokenExists = true;
                        console.log(vm.token);
                        TokenService.getUserMedications(function (response) {
                            console.log("get user meds response: " + response);
                            vm.importedMedications = getMedications(response);
                            console.log(vm.importedMedications);
                            var promises = [];
                            vm.importedMedications.forEach(function (elem) {
                                promises.push(medications.saveMedication(elem));
                            });

                            $q.all().finally(
                                function () {
                                    $ionicLoading.hide();
                                    vm.importComplete = true;
                                }
                            );

                        });
                    }
                })
            }, function (error) {
                console.log("error: " + error);
                vm.oauthError = "error " + error;
                $ionicLoading.hide();
            });
        }

        function pickMedication(medication) {
            console.log('Medication picked:', medication);
            medications.setMedication(medication);
            $state.go('onboarding-log.medications.schedule');
        }

        function refresh() {
            medications.fetchAll().then(
                function (medications) {
                    update(medications);
                    $scope.$broadcast('scroll.refreshComplete');
                },
                function (error) {
                    console.log(error);

                }
            );
        }

        function update(medications) {
            vm.medications = medications;
            vm.hasImported = !!(_.find(vm.medications, {origin: 'imported'}));
        }

        function editMedication(medication) {
            medications.setMedication(medication);
            $state.go('onboarding-log.medications.schedule')
        }

        function getMedicationText(medication) {
            var text = '';
            if (medication && medication.schedule.times && medication.schedule.times.length) {
                var eventsCount = medication.schedule.times.length;
                text += eventsCount;
                text += ' event' + (eventsCount > 1 ? 's' : '') + ' per day'
            }

            return text;
        }
    }


})();
