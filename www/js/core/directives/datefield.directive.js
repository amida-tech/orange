(function () {
    "use strict";

    angular.module('orange')
        .directive('datefield', datefield);


    datefield.$inject = ['$cordovaDatePicker'];

    function datefield($cordovaDatePicker) {
        return {
            scope: {
                'maxDateNow': '='
            },
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
                        var options = {
                            date: ngModel.$viewValue ? new Date(ngModel.$viewValue) : new Date(),
                            mode: 'date',
                            allowOldDates: true,
                            allowFutureDates: true,
                            androidTheme: $cordovaDatePicker.THEME_DEVICE_DEFAULT_DARK
                        };
                        if (scope.maxDateNow) {
                            options['maxDate'] = device.platform === 'Android' ? Date.now() : new Date();
                        }
                        $cordovaDatePicker.show(options).then(function (date) {
                            var newValue = date.toJSON().slice(0, 10);
                            //alert(newDate);
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
