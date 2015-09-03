(function () {
    "use strict";

    angular
        .module('orange')
        .factory('MedicationService', MedicationService);

    MedicationService.$inject = ['$q', 'n2w', 'notifications', 'PagingService'];

    /* @ngInject */
    function MedicationService($q, n2w, notify, PagingService) {
        var Service = function () {
            PagingService.constructor.call(this);

            this.apiEndpoint = 'medications';
            this.removeItem = removeItem;
            this.newItemSuccess = newItemSuccess;
            this.saveItem = saveItem;

            this.getEventText = getEventText;
            this.getMedicationText = getMedicationText;
            this.setMedicationSchedule = setMedicationSchedule;
            this.setMedicationEvents = setMedicationEvents;
            this.setNotifications = setNotifications;
        };
        Service.prototype = PagingService;

        return new Service();


        function saveItem(savedItem) {
            var promise = PagingService.saveItem.call(this, savedItem);
            if (savedItem.id) {
                promise = promise.then(function () {
                    notify.updateNotify();
                })
            }
            return promise;
        }

        function removeItem(removedItem) {
            var self = this;
            return PagingService.removeItem.call(this, removedItem).then(function () {
                notify.updateNotify();
                return self.items;
            });
        }

        function newItemSuccess(newItem, addCondition) {
            if (addCondition === undefined) {
                addCondition = true;
            }
            var importCondition = !newItem['import_id'] || !_.find(this.items, {import_id: newItem['import_id']});
            PagingService.newItemSuccess.call(this, newItem, addCondition && importCondition);
            notify.addNotifyByMedication(newItem);
        }

        function setNotifications(notifications) {
            var promises = [],
                medication = this.item;
            for (var i = 0, len = medication.schedule.times.length; i < len; i++) {
                var time = medication.schedule.times[i];
                var notification = notifications[i] || 30;
                console.log('setting notification time', medication.id, time.id, notification);
                var promise = medication.all('times').one(time.id.toString()).customPUT({
                   user: notification
                });
                promises.push(promise);
            }
            return $q.all(promises);
        }

        function setMedicationSchedule(schedule) {
            this.item.schedule = schedule;
        }

        function setMedicationEvents(events) {
            this.item.schedule.times = events;
        }

        function getEventText(event) {
            var result = '';
            var units = this.item.dose.quantity;
            result += _.capitalize(n2w.toWords(units || 0));
            result += ' unit' + (units === 1 ? '' : 's');
            if (event.type == 'exact') {
                result += ' at ' + event.time;
            } else {
                result += ' ' + event.when + ' ' + event.event;
            }
            return result;
        }

        function getMedicationText(medication) {
            var text = '';
            if (medication && medication.schedule.times && medication.schedule.times.length) {
                var eventsCount = medication.schedule.times.length;
                text += eventsCount;
                text += ' event' + (eventsCount > 1 ? 's' : '') + ' per day'
            }

            return text;
        }
    }
})();
