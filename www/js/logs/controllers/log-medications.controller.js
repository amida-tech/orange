(function () {
    "use strict";

    angular
        .module('orange')
        .controller('LogMedicationsCtrl', LogMedicationsCtrl);

    LogMedicationsCtrl.$inject = [
        '$scope', '$q', '$state', '$stateParams', '$ionicLoading', 'TokenService', 'Oauth',
        'PatientService', 'MedicationService'
    ];

    /* @ngInject */
    function LogMedicationsCtrl($scope, $q, $state, $stateParams,
                                $ionicLoading, TokenService, Oauth, PatientService, MedicationService) {
        /* jshint validthis: true */
        var vm = this;

        vm.importComplete = false;
        vm.hasImported = false;
        vm.medications = null;
        if ($stateParams['patient_id']) {
            PatientService.getItem($stateParams['patient_id']).then(function (patient) {
                vm.log = patient;
            });
        } else {
            PatientService.getPatient().then(function (patient) {
                vm.log = patient;
            })
        }


        vm.pickMedication = pickMedication;
        vm.getSMARTToken = getSMARTToken;
        vm.editMedication = editMedication;

        refresh();

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
                schedule: {
                    as_needed: true,
                    take_with_medications: [],
                    take_without_medications: [],
                    take_with_food: null
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
	                if (content && content.resourceType === 'MedicationOrder') {
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
	                    } else { //Medication is not in contained but in bundle itself
	                        console.log("content.medicationReference", content.medicationReference.reference);
	                        if (content.medicationReference) {
	                            var splitted = (content.medicationReference.reference || '').split('/');
	                            var medicationId = splitted[splitted.length - 1];
	                            var j, resource;
	                            for (j = 0; j < len; j++) {
	                                var resource = val.entry[j].content || val.entry[j].resource;
	                                if (resource && resource.resourceType === 'Medication' && resource.id === medicationId) {
	                                    console.log(JSON.stringify(resource, null, 4));
	                                    if (resource.code && resource.code.coding && resource.code.coding.length) {
	                                        var med = {
	                                            'name': resource.code.coding[0].display,
	                                            'status': content.status
	                                        };
	                                        if (resource.code.coding[0].code) {
	                                            med.code = parseInt(resource.code.coding[0].code);
	                                        }
	                                        med = prepareMedication(med);
	                                        /*console.log("content.dosageInstruction.timing", content.dosageInstruction, content.dosageInstruction[0].timing);
	                                        if( content.dosageInstruction && content.dosageInstruction.length) {
	                                            var repeat = content.dosageInstruction[0].timing.repeat;
	                                            console.log("content.dosageInstruction.timing", content.dosageInstruction[0].timing);
	                                            if(repeat) {
	                                                if(repeat.period && repeat.periodUnits) {
	                                                    med.schedule.as_needed = false;
	                                                    med.schedule.regularly = true;
	                                                    med.schedule.frequency = {'unit': repeat.periodUnits, 'n': repeat.period };
	                                                }
	                                            }
	                                        }
	                                        console.log(JSON.stringify(med, null, 4));*/
	                                        result.push(med);
	                                    }
	                                    break;
	                                }
	                            }
	                        } else if (content.medicationCodeableConcept && content.medicationCodeableConcept.coding && content.medicationCodeableConcept.coding.length) {
	                            var med = {
	                                'name': content.medicationCodeableConcept.coding[0].display,
	                                'status': content.status
	                            };
	                            if (resource.code.coding[0].code) {
	                                med.code = parseInt(resource.code.coding[0].code);
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
            TokenService.getDRECredentials(function (credentials) {
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
                            console.log("get user meds response: " + JSON.stringify(response, null, 2));
                            vm.importedMedications = getMedications(response);
                            console.log(vm.importedMedications);
                            var promises = [];
                            vm.importedMedications.forEach(function (elem) {
                                promises.push(MedicationService.saveItem(elem));
                            });

                            $q.all().finally(
                                function () {
                                    $ionicLoading.hide();
                                    vm.importComplete = true;
                                    if ($state.current.name === 'app.medications_import') {
                                        $state.go('app.medications');
                                    }
                                }
                            );

                        });
                    }
                })
            }, function (error) {
                if (error === null) {
                    $ionicLoading.hide();
                    return;
                }

                console.log("error: " + error);
                vm.oauthError = "error " + error;
                $ionicLoading.hide();
            });
        }

        function pickMedication(medication, $event) {
            if ($event.target.tagName == 'SPAN') {
                return;
            }

            console.log('Medication picked:', medication);
            MedicationService.setItem(medication);
            vm.medication = medication;
            $state.go('onboarding-log.medications.schedule');
        }

        function refresh() {
            MedicationService.getItems(true).then(
                function (medications) {
                    vm.medications = medications;
                    vm.hasImported = !!(_.find(vm.medications, {origin: 'imported'}));
                    $scope.$broadcast('scroll.refreshComplete');
                },
                function (error) {
                    $scope.$broadcast('scroll.refreshComplete');
                    console.log(error);

                }
            );
        }

        function editMedication(medication, $event) {
            if ($event.target.tagName == 'SPAN') {
                return;
            }

            MedicationService.setItem(medication);
            vm.medication = medication;
            $state.go('onboarding-log.medications.schedule')
        }
    }


})();
