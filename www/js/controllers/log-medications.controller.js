(function () {
    "use strict";

    angular
        .module('orange')
        .controller('LogMedicationsCtrl', LogMedicationsCtrl);

    LogMedicationsCtrl.$inject = ['$scope', '$q', '$timeout', 'OrangeApi'];

    /* @ngInject */
    function LogMedicationsCtrl($scope, $q, $timeout, OrangeApi) {

        $scope.medications = [];

        $scope.search = {
            result: [],
            suggestions: [],
            term: null,
            timer: null
        };

        $scope.searchMedication = searchMedication;
        $scope.pickSuggestion = pickSuggestion;


        function pickSuggestion(suggestion) {
            $scope.search.term = suggestion;
            searchMedication();
        }

        function searchMedication() {

            var name = $scope.search.term;

            if (!name) return;

            if ($scope.search.timer) {
                $timeout.cancel($scope.search.timer);
            }
            $scope.search.timer = $timeout(function () {
                var data = {medname: name};
                OrangeApi.rxnorm.search.post(data).then(
                    function (data) {
                        $scope.search.suggestions = [];
                        $scope.search.result = [];
                        console.log(data.plain());
                        var result = data.plain().result;
                        if (result.compiled.length) {
                            var medications = [];
                            result.compiled.forEach(function(elem) {
                                medications.push({
                                    name: elem.modifiedname,
                                    brand: elem.brand,
                                    rx_norm: elem.rxcui || null,
                                    form: elem.dfg.length ? elem.dfg[0] : null
                                });
                            });
                            $scope.search.result = medications;
                        } else {
                            // Get suggestions if result is empty
                            getSuggestions(name).then(function (data) {
                                $scope.search.suggestions = data;
                            });
                        }
                        $scope.search.timer = null;
                    },
                    function (error) {
                        $scope.search.timer = null;
                    }
                );
            }, 1000);
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
