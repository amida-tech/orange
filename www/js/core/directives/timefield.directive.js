(function () {
    "use strict";

    angular.module('orange')
        .directive('timefield', timefield);


    timefield.$inject = ['$cordovaDatePicker'];

    function timefield($cordovaDatePicker) {
        return {
            scope: {},
            require: 'ngModel',
            link: function (scope, elem, attrs, ngModel) {

                if (ionic.Platform.isWebView()) {
                    // Add readonly attribute to input to not display keyboard on iOS devices
                    elem.addClass('not-readonly');
                    elem.attr('readonly', true);
                }

                elem.bind('click', function () {
                    if (ionic.Platform.isWebView()) {
                        // Running on device show datepicker
                        var time = ngModel.$viewValue;
                        var date = new Date();

                        if (!!time) {
                            var parts = time.split(':');
                            date.setHours(parts.shift());
                            date.setMinutes(parts.shift());
                        }

                        var options = {
                            date: date,
                            mode: 'time',
                            allowOldDates: true,
                            allowFutureDates: true,
                            androidTheme: $cordovaDatePicker.THEME_DEVICE_DEFAULT_DARK
                        };
                        $cordovaDatePicker.show(options).then(function (date) {

                            var hours = date.getHours();
                            hours = (hours < 10 ? '0' : '') + hours;
                            var minutes = date.getMinutes();
                            minutes = (minutes < 10 ? '0' : '') + minutes;

                            var newValue = hours + ':' + minutes;
                            ngModel.$setViewValue(newValue);
                            elem.val(newValue);
                        });
                    } else {
                        // Steps for web app here
                    }
                })
            }
        }
    }
})();
