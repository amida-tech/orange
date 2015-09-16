(function () {
    "use strict";

    angular
        .module('orange')
        .directive('onlyNumbers', onlyNumbers);

    function onlyNumbers() {
        return {
            require: '?ngModel',
            scope: {},
            link: function (scope, element, attributes, ngModel) {
                var _value;
                ngModel.$parsers.unshift(function (val) {
                    if (_value === undefined) {
                        _value = ngModel.$modelValue;
                    }
                    if (val === undefined || val === null) {
                        val = '';
                    }
                    var digits = val.toString().toString().split('').filter(function (s) {
                        return (!isNaN(s) && s != ' ');
                    }).join('');
                    _value = Number(digits) || _value;
                    ngModel.$viewValue = _value;
                    ngModel.$render();
                    return _value;
                });
            }
        }
    }

})();
