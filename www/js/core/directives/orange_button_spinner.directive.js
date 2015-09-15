(function () {
    "use strict";

    angular
        .module('orange')
        .directive('buttonSpinner', buttonSpinner);

    function buttonSpinner() {
        return {
            scope: {
                model: "=model",
                subscribe: "@subscribe"
            },
            templateUrl: 'templates/core/orange_button_spinner.html',
            link: function (scope, element, attributes, ngModel) {}
        }
    }

})();
