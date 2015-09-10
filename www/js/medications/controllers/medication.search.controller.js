(function () {
    "use strict";

    angular
        .module('orange')
        .controller('MedicationSearchCtrl', MedicationSearchCtrl);

    MedicationSearchCtrl.$inject = ['$timeout', 'OrangeApi', 'GlobalService'];

    function MedicationSearchCtrl($timeout, OrangeApi, GlobalService) {
        var vm = this;

        vm.term = null;
        vm.timer = null;
        vm.result = [];
        vm.suggestions = [];
        vm.title = 'Search Medication';

        vm.pickSuggestion = pickSuggestion;
        vm.search = search;

        ////////////////

        function pickSuggestion(suggestion) {
            vm.term = suggestion;
            search();
        }

        function search() {
            vm.timer && $timeout.cancel(vm.timer);
            if (!vm.term) {
                vm.timer = null;
                return;
            }

            vm.timer = $timeout(function () {
                var data = {medname: vm.term};
                OrangeApi.rxnorm.search.post(data).then(
                    function (data) {
                        vm.result = [];
                        vm.suggestions = [];
                        var result = data.plain().result;
                        if (result.compiled && result.compiled.length) {
                            vm.result = _.map(result.compiled, resultMapper);
                            vm.timer = null;
                        } else {
                            //Result is empty get suggestions
                            getSuggestions();
                        }
                    },
                    function (error) {
                        vm.timer = null;
                        GlobalService.showError('Cannot get search results');
                    });
            }, 1000)
        }

        function getSuggestions() {
            var data = {medname: vm.term};
            OrangeApi.rxnorm.spelling.post(data).then(
                function (data) {
                    vm.suggestions = data.plain()['result']['suggestionGroup']['suggestionList']['suggestion'];
                    vm.timer = null;
                },
                function (error) {
                    vm.timer = null;
                    GlobalService.showError('Cannot get suggestions');
                });
        }

        function resultMapper(elem) {
            return {
                name: elem.modifiedname,
                brand: elem.brand,
                rx_norm: elem.rxcui || null,
                form: parseDfg(elem.dfg),
                origin: 'manual',
                dose: {
                    quantity: null,
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
    }
})();
