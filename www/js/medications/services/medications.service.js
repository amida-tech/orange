(function () {
    "use strict";

    angular
        .module('orange')
        .factory('MedicationService', MedicationService);

    MedicationService.$inject = ['$q', 'n2w', 'notifications', 'PatientPagingService', 'errorList'];

    /* @ngInject */
    function MedicationService($q, n2w, notify, PatientPagingService, errorList) {
        var Service = function () {
            PatientPagingService.call(this);

            this.apiEndpoint = 'medications';

            this.errorItemNotFound = errorList.INVALID_MEDICATION_ID;
            this.errorItemNotFoundText = 'Medication not found';
        };

        Service.prototype = Object.create(PatientPagingService.prototype);
        Service.prototype.removeItem = removeItem;
        Service.prototype.newItemSuccess = newItemSuccess;
        Service.prototype.saveItem = saveItem;

        Service.prototype.getEventText = getEventText;
        Service.prototype.getMedicationText = getMedicationText;
        Service.prototype.setMedicationSchedule = setMedicationSchedule;
        Service.prototype.setMedicationEvents = setMedicationEvents;
        Service.prototype.setNotifications = setNotifications;
        Service.prototype.getNotifications = getNotifications;
        Service.prototype.updateNotification = updateNotification;

        return new Service();


        function saveItem(savedItem) {
            var promise = PatientPagingService.prototype.saveItem.call(this, savedItem);
            if (savedItem.id) {
                promise = promise.then(function () {
                    notify.updateNotify();
                })
            }
            return promise;
        }

        function removeItem(removedItem) {
            var self = this;
            return PatientPagingService.prototype.removeItem.call(this, removedItem).then(function () {
                notify.updateNotify();
                return self.items;
            });
        }

        function newItemSuccess(newItem, addCondition) {
            if (addCondition === undefined) {
                addCondition = true;
            }
            var importCondition = !newItem['import_id'] || !_.find(this.items, {import_id: newItem['import_id']});
            PatientPagingService.prototype.newItemSuccess.call(this, newItem, addCondition && importCondition);
            notify.addNotifyByMedication(newItem);
        }

        function updateNotification(id, value) {
            var medication = this.item;
            return medication.all('times').one(id.toString()).customPUT({
                user: value
            });
        }

        function setNotifications(notifications) {
            var promises = [],
                medication = this.item;
            for (var i = 0, len = medication.schedule.times.length; i < len; i++) {
                var time = medication.schedule.times[i];
                var notification = notifications[i] || 30;
                if (!_.isNaN(parseInt(notification))) {
                    notification = parseInt(notification);
                }
                console.log('setting notification time', medication.id, time.id, notification);
                var promise = medication.all('times').one(time.id.toString()).customPUT({
                    user: notification
                });
                promises.push(promise);
            }
            return $q.all(promises);
        }

        function getNotifications() {
            var medication = this.item;
            if (medication.schedule && medication.schedule.times) {
                var promises = [];

                for (var i = 0, len = medication.schedule.times.length; i < len; i++) {
                    var time = medication.schedule.times[i];
                    var promise = medication.all('times').one(time.id.toString()).customGET();
                    promises.push(promise);
                }
                return $q.all(promises);
            } else {
                var deffered = $q.defer();
                deffered.resolve([]);
                return deffered.promise;
            }
        }

        function setMedicationSchedule(schedule) {
            this.item.schedule = schedule;
        }

        function setMedicationEvents(events) {
            this.item.schedule.times = events;
        }

        function getEventText(event) {
            var result = '';
            if (this.item) {
                var quantity = this.item.dose.quantity;
                var unit = this.item.dose.unit;
                result += _.capitalize(n2w.toWords(quantity || 0));
                result += ' ' + unit;
                if (event.type == 'exact') {
                    result += ' at ' + event.time;
                } else {
                    if (event.when === 'after' && event.event === 'sleep') {
                        result += ' ' + 'after wake';
                    } else {
                        result += ' ' + event.when + ' ' + event.event;
                    }
                }
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
