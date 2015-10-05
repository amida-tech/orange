(function () {
    'use strict';

    angular
        .module('orange')
        .directive('fieldMaxLength', fieldMaxLength);

    function fieldMaxLength() {
        return {
            require: 'ngModel',
            link: function (scope, elem, attrs, ngModel) {
                var maxLength = Number(attrs.fieldMaxLength);
                ngModel.$parsers.push(function (text) {
                    if (text.length > maxLength) {
                        var input = text.substring(0, maxLength);
                        ngModel.$setViewValue(input);
                        ngModel.$render();
                        return input;
                    }
                    return text;
                });
            }
        };
    }
})();
