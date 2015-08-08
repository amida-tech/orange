(function () {
    "use strict";

    angular
        .module('orange')
        .controller('LogMedicationsCtrl', LogMedicationsCtrl);

    LogMedicationsCtrl.$inject = ['$q', '$timeout', '$state', 'OrangeApi', 'Oauth', 'TokenService', 'n2w', 'log', 'medications'];

    /* @ngInject */
    function LogMedicationsCtrl($q, $timeout, $state, OrangeApi, Oauth, TokenService, n2w, log, medications) {
        /* jshint validthis: true */
        var vm = this;

        vm.log = log;
        vm.events = [];
        vm.medicationTimeEvents = 3;
        vm.medications = medications;

        vm.event = {
            n: 1,
            eventType: 'meal',
            event: 'breakfast',
            when: 'before'
        };

        vm.medication = {
            name: 'Acetaminophen',
            brand: 'Tylenol',
            form: 'Oral Tablet',
            rx_norm: '12343440',
            schedule: {
                as_needed: true,
                regularly: false,
                take_with_food: null,
                take_with_medications: [],
                take_without_medications: []
            }
        };

        vm.search = {
            result: [],
            suggestions: [],
            term: null,
            timer: null
        };

        vm.when = [
            {name: 'Before', key: 'before'},
            {name: 'After', key: 'after'}
        ];

        vm.meals = [
            {name: 'Breakfast', key: 'breakfast'},
            {name: 'Lunch', key: 'lunch'},
            {name: 'Dinner', key: 'dinner'}
        ];

        vm.sleep = [
            {name: 'Wake', key: 'wake'},
            {name: 'Sleep', key: 'sleep'}
        ];

        vm.withFood = [
            {name: 'Yes', key: true},
            {name: 'No', key: false},
            {name: 'Doesn\'t Matter', key: null}
        ];

        vm.eventTypes = [
            {name: 'Around a Meal', key: 'meal'},
            {name: 'As a Set Time', key: 'time'},
            {name: 'Morning/Night', key: 'sleep'}
        ];

        vm.searchMedication = searchMedication;
        vm.pickSuggestion = pickSuggestion;
        vm.selectMedication = selectMedication;
        vm.getSMARTToken = getSMARTToken;
        vm.setScheduleType = setScheduleType;
        vm.setUntil = setUntilType;
        vm.setupEvents = setupEvents;
        vm.setFrequency = setFrequency;
        vm.scheduleEvent = scheduleEvent;
        vm.getEventText = getEventText;

        ////////////////
        function scheduleEvent() {
            if (vm.event !== null) {
                console.log(vm.event);
                vm.events.push(vm.event);
                vm.event = {
                    n: vm.event.n + 1,
                    eventType: 'meal',
                    event: 'breakfast',
                    when: 'before'
                };
                if (vm.event.n > vm.medicationTimeEvents) vm.event = null;
            } else {
                console.log(vm.events);
                saveMedication();
            }
        }

        function saveMedication() {
            vm.medication.schedule.times = [];

            for (var i = 0, len = vm.events.length; i < len; i++) {
                var item = vm.events[i];
                var time = angular.extend({}, item);
                delete time.eventType;
                delete time.n;
                delete time.units;
                if (item.eventType === 'time') {
                    delete time.when;
                    delete time.event;
                    time.type = 'exact';
                } else {
                    time.type = 'event';
                    delete time.time;
                }
                vm.medication.schedule.times.push(time);
            }
            console.log(vm.medication);
            log.all('medications').post(vm.medication).then(
                function (data) {
                    console.log(data);
                },
                function (error) {
                    console.log(error);
                }
            )
        }

        function getEventText(event) {
            var result = '';
            result += _.capitalize(n2w.toWords(event.units || 0));
            result += ' unit' + (event.units === 1 ? '' : 's');
            if (event.eventType == 'time') {
                result += ' at ' + event.time;
            } else {
                result += ' ' + event.when + ' ' + event.event;
            }
            return result;
        }

        function setupEvents() {
            vm.events = [];
            vm.event = {
                n: 1,
                eventType: 'meal',
                event: 'breakfast',
                when: 'before'
            };
            $state.go('onboarding-log.medications.events');
        }

        function setFrequency(frequency) {
            vm.medication.schedule.frequency = {
                unit: 'day',
                n: 1
            }
        }

        function setUntilType(untilType) {
            vm.medication.schedule.until = {
                type: untilType,
                stop: null
            }
        }

        function setScheduleType(scheduleType) {
            if (scheduleType === 'as_needed') {
                vm.medication.schedule.as_needed = true;
                vm.medication.schedule.regularly = false;
            } else if (scheduleType == 'regularly') {
                vm.medication.schedule.as_needed = false;
                vm.medication.schedule.regularly = true;
            } else {
                vm.medication.schedule.as_needed = true;
                vm.medication.schedule.regularly = true;
            }

            if (vm.medication.schedule.regularly && !vm.medication.schedule.until) {
                vm.medication.schedule.until = {
                    type: 'forever'
                }
            }

            if (vm.medication.schedule.regularly && !vm.medication.schedule.frequency) {
                vm.medication.schedule.frequency = {
                    unit: 'day',
                    n: 1
                }
            }

        }

        function selectMedication(medication) {
            vm.medication = angular.extend({}, medication);
            vm.medication.schedule = {
                as_needed: true,
                regularly: false
            };
            $state.go('onboarding-log.medications.schedule');
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

        function pickSuggestion(suggestion) {
            vm.search.term = suggestion;
            searchMedication();
        }

        function searchMedication() {

            var name = vm.search.term;

            if (!name) {
                $timeout.cancel(vm.search.timer);
                vm.search.timer = null;
                return;
            }

            if (vm.search.timer) {
                $timeout.cancel(vm.search.timer);
            }
            vm.search.timer = $timeout(function () {
                var data = {medname: name};
                OrangeApi.rxnorm.search.post(data).then(
                    function (data) {
                        vm.search.suggestions = [];
                        vm.search.result = [];
                        console.log(data.plain());
                        var result = data.plain().result;
                        if (result.compiled.length) {
                            var medications = [];
                            result.compiled.forEach(function (elem) {
                                medications.push({
                                    name: elem.modifiedname,
                                    brand: elem.brand,
                                    rx_norm: elem.rxcui || null,
                                    form: parseDfg(elem.dfg)
                                });
                            });
                            vm.search.result = medications;
                        } else {
                            // Get suggestions if result is empty
                            getSuggestions(name).then(function (data) {
                                vm.search.suggestions = data;
                            });
                        }
                        vm.search.timer = null;
                    },
                    function (error) {
                        vm.search.timer = null;
                    }
                );
            }, 1000);
        }

        function parseDfg(dfg) {
            var result = null;
            if (dfg.length == 1) {
                result = dfg[0];
            } else if (dfg.length > 1) {
                result = dfg.slice(0, -1).join(', ');
                result += ' and/or ' + dfg.slice(-1);
            }
            return result;
        }

        function getSuggestions(name) {
            var deffered = $q.defer();
            var data = {medname: name};
            OrangeApi.rxnorm.spelling.post(data).then(
                function (data) {
                    var suggestions = data.plain()['result']['suggestionGroup']['suggestionList']['suggestion'];
                    deffered.resolve(suggestions || []);
                },
                function (error) {
                    console.log(error);
                    deffered.resolve([]);
                });
            return deffered.promise;
        }
    }
})();
