(function () {
    "use strict";

    angular
        .module('orange')
        .filter('trusted', trusted);

    trusted.$inject = ['$sce'];

    /* @ngInject */
    function trusted($sce) {
        return function(input) {
            return $sce.trustAsHtml(input);
        }
    }
})();
