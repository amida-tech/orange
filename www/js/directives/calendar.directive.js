(function () {
    "use strict";

    angular
        .module('orange')
        .directive('calendar', calendar);

    function calendar() {
        return {
            require: 'ngModel',
            replace: true,
            templateUrl: 'templates/partial/calendar.html',
            link: function (scope, element, attributes, ngModel) {
                scope.days = [];
                scope.selectedDays = [];
                scope.chunkedDays = null;
                scope.toggleDay = toggleDay;

                activate();

                function toggleDay(day) {
                    var index = scope.selectedDays.indexOf(day);
                    if (index === -1) {
                        scope.selectedDays.push(day)
                    } else {
                        scope.selectedDays.splice(index, 1);
                    }
                    ngModel.$setViewValue(scope.selectedDays);
                }

                function activate() {
                    var d = moment();
                    d.month(0);
                    for (var i = 0; i < 31; i++) {
                        d.date(i + 1);
                        scope.days.push({key: d.format('YYYY-MM-DD'), val: i + 1});

                    }
                    scope.chunkedDays = _.chunk(scope.days, 7);
                }

                scope.$watch(attributes['ngModel'], function(val) {
                    if (val && scope.selectedDays !== val) {
                        scope.selectedDays = val;
                    }
                });


            }
        }
    }
})();
