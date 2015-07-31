(function () {
    "use strict";

    angular
        .module('orange')
        .directive('compareTo', compareTo);

    function compareTo() {
        return {
            require: 'ngModel',
            scope: {
                otherValue: "=compareTo"
            },
            link: function (scope, element, attributes, ngModel) {

                ngModel.$validators.compareTo = function (modelValue) {
                    return modelValue == scope.otherValue;
                };

                scope.$watch("otherValue", function () {
                    ngModel.$validate();
                });
            }
        }
    }

})();
