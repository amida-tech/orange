(function () {
    "use strict";

    angular
        .module('orange')
        .controller('SearchMedicationCtrl', SearchMedicationCtrl);

    SearchMedicationCtrl.$inject = ['$scope', '$q', '$timeout', 'OrangeApi'];

    /* @ngInject */
    function SearchMedicationCtrl($scope, $q, $timeout, OrangeApi) {

    }
})();
