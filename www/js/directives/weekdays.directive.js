(function () {
    "use strict";

    angular
        .module('orange')
        .directive('weekdays', weekdays);

    function weekdays() {
        return {
            require: 'ngModel',
            replace: true,
            templateUrl: 'templates/partial/weekdays.html',
            link: function (scope, element, attributes, ngModel) {

                scope.weekDays = _.map(moment.weekdaysShort(), function (day, index) {
                    return {name: day, key: index};
                });

                scope.selectedDays = _.map(scope.weekDays, function(day, index) {
                    return index;
                });

                scope.toggleDay = toggleDay;

                activate();

                function toggleDay(day) {
                    var index = scope.selectedDays.indexOf(day);
                    if (index === -1) {
                        if (scope.selectedDays.length < 6) scope.selectedDays.push(day)
                    } else {
                        scope.selectedDays.splice(index, 1);
                    }
                    ngModel.$setViewValue(scope.selectedDays);
                }

                function activate() {

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
