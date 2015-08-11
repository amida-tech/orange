(function () {
    "use strict";

    angular
        .module('orange')
        .directive('buttonBar', buttonBar);

    buttonBar.$inject = [];

    function buttonBar() {
        return {
            require: 'ngModel',
            scope: {
                options: "=buttonBar"
            },
            replace: true,
            templateUrl: 'templates/partial/button-bar.html',
            link: function (scope, element, attributes, ngModel) {

                scope.value = null;

                scope.select = function(option) {
                    scope.value = option.key;
                    ngModel.$setViewValue(option.key);
                };
                scope.select(scope.options[0]);

                scope.$watch(
                    function(){
                        return ngModel.$modelValue;
                    }, function(newValue, oldValue){
                        if (newValue !== oldValue) {
                            scope.value = newValue;
                        }
                    }, true);

            }
        }
    }
})();
