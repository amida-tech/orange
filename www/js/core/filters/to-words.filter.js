(function () {
    "use strict";

    angular
        .module('orange')
        .filter('toWords', toWords);

    toWords.$inject = ['n2w'];

    /* @ngInject */
    function toWords(n2w) {
        return function(input, isOrdinal) {
            var n = parseInt(input);
            var result = input;
            if (n) {
                result = isOrdinal ? n2w.toWordsOrdinal(n) : n2w.toWords(n);
            }
            return result;
        }
    }
})();
