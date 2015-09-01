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
            templateUrl: 'templates/core/button-bar.html',
            link: function (scope, element, attributes, ngModel) {

                scope.value = scope.options[0].key;

                scope.select = function (option) {
                    scope.value = option.key;
                    ngModel.$setViewValue(option.key);
                };

                ngModel.$render = function () {
                    var exists = _.filter(scope.options, function(elem) {
                       return elem.key ===  ngModel.$viewValue;
                    });
                    if (_.isUndefined(ngModel.$viewValue) || !exists.length) {
                        ngModel.$setViewValue(scope.value);
                    }
                };

                scope.$watch(
                    function () {
                        return ngModel.$modelValue;
                    },
                    function (newValue) {
                        console.log('button-bar new value', newValue);
                        if (!_.isUndefined(newValue) && scope.value !== newValue) {
                            scope.value = newValue;
                        }
                    }, true);

            }
        }
    }
})();
