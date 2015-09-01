/*
 The MIT License (MIT)

 Copyright (c) 2015 Martin Eneqvist <marlun78@hotmail.com> (https://github.com/marlun78)

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
*/

(function () {
    "use strict";

    angular
        .module('orange')
        .factory('n2w', n2w);

    n2w.$inject = [];

    /* @ngInject */
    function n2w() {
        var service = {
            toOrdinal: toOrdinal,
            toWords: toWords,
            toWordsOrdinal: toWordsOrdinal
        };

        var endsWithDoubleZero = /(hundred|thousand|(m|b|tr|quadr)illion)$/;
        var endsWithTeen = /teen$/;
        var endsWithY = /y$/;
        var endsWithZeroThroughTwelve = /(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)$/;
        var ordinalLessThanThirteen = {
            zero: 'zeroth',
            one: 'first',
            two: 'second',
            three: 'third',
            four: 'fourth',
            five: 'fifth',
            six: 'sixth',
            seven: 'seventh',
            eight: 'eighth',
            nine: 'ninth',
            ten: 'tenth',
            eleven: 'eleventh',
            twelve: 'twelfth'
        };

        var TEN = 10;
        var ONE_HUNDRED = 100;
        var ONE_THOUSAND = 1000;
        var ONE_MILLION = 1000000;
        var ONE_BILLION = 1000000000;           //         1.000.000.000 (9)
        var ONE_TRILLION = 1000000000000;       //     1.000.000.000.000 (12)
        var ONE_QUADRILLION = 1000000000000000; // 1.000.000.000.000.000 (15)
        var MAX = 9007199254740992;             // 9.007.199.254.740.992 (15)

        var LESS_THAN_TWENTY = [
            'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
            'nine',
            'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
            'seventeen', 'eighteen', 'nineteen'
        ];

        var TENTHS_LESS_THAN_HUNDRED = [
            'zero', 'ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy',
            'eighty', 'ninety'
        ];

        return service;

        ////////////////

        function toWordsOrdinal(number) {
            var words = toWords(number);
            return makeOrdinal(words);
        }

        function toOrdinal(number) {
            if (!isFinite_(number)) {
                console.error('Not a finite number');
            }
            var str = String(Math.floor(number));
            var lastChar = str.charAt(str.length - 1);
            return str + (lastChar === '1' ? 'st'
                    : lastChar === '2' ? 'nd'
                    : lastChar === '3' ? 'rd'
                    : 'th');
        }

        function isFinite_(value) {
            return typeof value === 'number' && isFinite(value);
        }

        function makeOrdinal(words) {
            // Ends with *00 (100, 1000, etc.) or *teen (13, 14, 15, 16, 17, 18, 19)
            if (endsWithDoubleZero.test(words) || endsWithTeen.test(words)) {
                return words + 'th';
            }
            // Ends with *y (20, 30, 40, 50, 60, 70, 80, 90)
            else if (endsWithY.test(words)) {
                return words.replace(endsWithY, 'ieth');
            }
            // Ends with one through twelve
            else if (endsWithZeroThroughTwelve.test(words)) {
                return words.replace(endsWithZeroThroughTwelve, function (match, numberWord) {
                    return ordinalLessThanThirteen[numberWord];
                });
            }
            return words;
        }

        function toWords(number, asOrdinal) {
            var words;
            if (!isFinite(number)) {
                throw new TypeError('Not a finite number');
            }
            words = generateWords(Math.floor(number));
            return asOrdinal ? makeOrdinal(words) : words;
        }

        function generateWords(number) {
            var remainder, word,
                words = arguments[1];

            // We’re done
            if (number === 0) {
                return !words ? 'zero' : words.join(' ').replace(/,$/, '');
            }
            // First run
            if (!words) {
                words = [];
            }
            // If negative, prepend “minus”
            if (number < 0) {
                words.push('minus');
                number = Math.abs(number);
            }

            if (number < 20) {
                remainder = 0;
                word = LESS_THAN_TWENTY[number];

            } else if (number < ONE_HUNDRED) {
                remainder = number % TEN;
                word = TENTHS_LESS_THAN_HUNDRED[Math.floor(number / TEN)];
                // In case of remainder, we need to handle it here to be able to add the “-”
                if (remainder) {
                    word += '-' + LESS_THAN_TWENTY[remainder];
                    remainder = 0;
                }

            } else if (number < ONE_THOUSAND) {
                remainder = number % ONE_HUNDRED;
                word = generateWords(Math.floor(number / ONE_HUNDRED)) + ' hundred';

            } else if (number < ONE_MILLION) {
                remainder = number % ONE_THOUSAND;
                word = generateWords(Math.floor(number / ONE_THOUSAND)) + ' thousand,';

            } else if (number < ONE_BILLION) {
                remainder = number % ONE_MILLION;
                word = generateWords(Math.floor(number / ONE_MILLION)) + ' million,';

            } else if (number < ONE_TRILLION) {
                remainder = number % ONE_BILLION;
                word = generateWords(Math.floor(number / ONE_BILLION)) + ' billion,';

            } else if (number < ONE_QUADRILLION) {
                remainder = number % ONE_TRILLION;
                word = generateWords(Math.floor(number / ONE_TRILLION)) + ' trillion,';

            } else if (number <= MAX) {
                remainder = number % ONE_QUADRILLION;
                word = generateWords(Math.floor(number / ONE_QUADRILLION)) +
                    ' quadrillion,';
            }

            words.push(word);
            return generateWords(remainder, words);
        }
    }
})();
