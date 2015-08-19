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
                'patient': '=',
                'withCheck': '='
            },
            templateUrl: 'templates/partial/avatar.html',
            replace: true,
            link: function (scope) {
                scope.imageSrc = null;
                scope.checked = false;
                scope.avatarClick = avatarClick;
                if (scope.patient) {
                    scope.patient.checked = false;
                    Avatar.getB64(scope.patient).then(
                        function (data) {
                            scope.imageSrc = data;
                        }
                    );
                }

                function avatarClick() {
                    if (scope.withCheck) {
                        scope.checked = !scope.checked;
                        scope.patient.checked = scope.checked;
                    }
                }
            }
        }
    }

})();
