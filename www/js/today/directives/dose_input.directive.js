(function () {
    "use strict";

    angular
        .module('orange')
        .directive('doseInput', doseInput);

    function doseInput() {
        return {
            scope: {
                model: "=model",
                subscribe: "@subscribe"
            },
            templateUrl: 'templates/today/dose-input.html',
            link: function (scope, element, attributes, ngModel) {
                scope.modelSubscribe = scope.model + ' ' + scope.subscribe;
                scope.$watch('model', function() {
                    scope.modelSubscribe = scope.model + ' ' + scope.subscribe;
                })
            }
        }
    }

})();
