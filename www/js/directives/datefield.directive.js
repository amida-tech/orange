(function () {
    "use strict";

    angular.module('orange')
        .directive('datetime', datetime);


    datetime.$inject = ['$cordovaDatePicker'];

    function datetime($cordovaDatePicker) {
        return {
            scope: {
                inputType: '@datetime'
            },
            require: 'ngModel',
            link: function (scope, elem, attrs, ngModel) {
                var inputType = scope.inputType || 'date';
                elem.bind('click', function (event) {
                    if (ionic.Platform.isWebView()) {
                        // Running on device show datepicker
                        var options = {
                            date: ngModel.$viewValue ? new Date(ngModel.$viewValue) : new Date(),
                            mode: inputType, // or 'time'
                            allowOldDates: true,
                            allowFutureDates: true,
                            androidTheme: $cordovaDatePicker.THEME_DEVICE_DEFAULT_DARK
                        };
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
