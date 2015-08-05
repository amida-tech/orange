(function () {
    "use strict";

    angular
        .module('orange')
        .directive('avatar', avatar);

    avatar.$inject = ['Avatar'];

    /* @ngInject */
    function avatar(Avatar) {
        return {
            scope: {
                'patient': '='
            },
            templateUrl: 'templates/partial/avatar.html',
            replace: true,
            link: function (scope, element, attributes, ngModel) {
                if (scope.patient) {
                    Avatar.getB64(scope.patient).then(
                        function (data) {
                            scope.imageSrc = data;
                        }
                    );
                } else {
                    scope.imageSrc = null;
                }
            }
        }
    }

})();
