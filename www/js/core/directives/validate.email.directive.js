(function () {
    'use strict';

    angular
        .module('orange')
        .directive('validateEmail', validateEmail);

    function validateEmail() {
        var REGEX = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

        return {
            require: 'ngModel',
            link: function (scope, elem, attrs, ngModel) {
                ngModel.$parsers.unshift(function (value) {
                    var valid = REGEX.test(value);
                    ngModel.$setValidity('validateEmail', valid);
                    return valid ? value : undefined;
                });
            }
        }
    }
})();
