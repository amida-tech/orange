(function () {
    'use strict';

    angular
        .module('orange')
        .directive('callPhone', callPhone);

    callPhone.$inject = ['$cordovaActionSheet'];

    function callPhone($cordovaActionSheet) {
        return {
            link: function (scope, elem) {
                elem.bind('click', call);
            }
        };

        function call() {
            var phone = this.getAttribute('phone') || this.innerText.match(/[\d\+]*/g).join('');
            if (phone[0] !== '+') {
                phone = '+1' + phone;
            }

            $cordovaActionSheet.show({
                title: 'Select action',
                buttonLabels: ['Call ' + phone, 'Message ' + phone],
                addCancelButtonWithLabel: 'Cancel',
                androidEnableCancelButton: true
            }).then(function (index) {
                switch (index) {
                    case 1:
                        document.location.href = 'tel:' + phone;
                        break;
                    case 2:
                        window.plugins.socialsharing.shareViaSMS('', phone);
                        break;
                }
            });
        }
    }
})();
