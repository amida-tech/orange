(function () {
    "use strict";

    angular
        .module('orange')
        .directive('medicationBlock', medicationBlock);

    function medicationBlock() {
        return {
            scope: {
                brand: "=medicationBrand",
                nameModel: "=medicationName"
            },
            templateUrl: 'templates/medications/medication-block.html',
            link: function (scope, element, attributes, ngModel) {
                scope.showFull = false;
                scope.showEvent = function() {
                    scope.showFull = !scope.showFull;
                }
            }
        }
    }

})();
