(function () {
    "use strict";

    angular.module('orange')
        .directive('timefield', timefield);


    timefield.$inject = ['$cordovaDatePicker', 'settings'];

    function timefield($cordovaDatePicker, settings) {
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
                        date.setHours(0);
                        date.setMinutes(0);

                        if (!!time) {
                            date = moment(time, settings.timeFormat).toDate();
                        }

                        var options = {
                            date: date,
                            mode: 'time',
                            minuteInterval: 5,
                            allowOldDates: true,
                            allowFutureDates: true,
                            androidTheme: $cordovaDatePicker.THEME_DEVICE_DEFAULT_DARK
                        };
                        $cordovaDatePicker.show(options).then(function (date) {
                            if (date) {
                                var time = moment(date).format(settings.timeFormat);
                                ngModel.$setViewValue(time);
                                elem.val(time);
                            }
                        });
                    } else {
                        // Steps for web app here
                    }
                })
            }
        }
    }
})();
