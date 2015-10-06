(function () {
    "use strict";

    angular
        .module('orange')
        .directive('onlyNumbers', onlyNumbers);

    function onlyNumbers() {
        return {
            require: '?ngModel',
            scope: {
                'max': '=max'
            },
            link: function (scope, element, attributes, ngModel) {
                var _value;
                ngModel.$parsers.unshift(function (val) {
                    if (_value === undefined) {
                        _value = ngModel.$modelValue;
                    }
                    if (val === undefined || val === null) {
                        val = '';
                    }
                    if (val.toString().match(/^(\d+\.?\d*)?$/g) && val != 0 || val === '') {
                        _value = val;
                    }
                    if (scope.max && _value > scope.max) {
                        _value = scope.max;
                    }
                    ngModel.$viewValue = _value;
                    ngModel.$render();
                    return _value;
                });
            }
        }
    }

})();
