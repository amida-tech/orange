(function() {
    "use strict";

    angular
        .module('orange')
        .controller('OfflineItemController', OfflineItemController);

    OfflineItemController.$inject = ['$locale', '$state', '$stateParams', '$cordovaInAppBrowser', 'OfflineService'];

    /* @ngInject */
    function OfflineItemController($locale, $state, $stateParams, $cordovaInAppBrowser, OfflineService) {
        /* jshint validthis: true */
        var vm = this;
        var itemId = $stateParams['id'];
        var serviceName = getServiceName();

        vm.item = OfflineService.getItem(serviceName, itemId);
        vm.getEventText = getEventText;
        vm.medicationStatusMap = {
            manual: 'Manually Entered',
            imported: 'Automatic Imported'
        };
        vm.callDoctor = function(phone) {
            document.location.href = 'tel:+1' + phone;
        };

        vm.days = $locale.DATETIME_FORMATS.DAY;

        vm.toMap = function () {
            $cordovaInAppBrowser.open('http://maps.apple.com/?q=' + vm.item.address.replace(' ', '+'), '_system');
        };

        //////////////////

        function getEventText(event) {
            return OfflineService.getMedicationEventText(event, vm.item);
        }


        function getServiceName() {
            var stateName = $state.current.name;
            var serviceName = null;
            if (stateName.indexOf('medication') >= 0) {
                serviceName =  'medications';
            } else if (stateName.indexOf('doctor') >= 0) {
                serviceName =  'doctors';
            } else if (stateName.indexOf('pharm') >= 0) {
                serviceName =  'pharmacies';
            }

            console.log(serviceName);
            return serviceName;
        }


    }
})();
