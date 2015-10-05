(function () {
    "use strict";

    angular
        .module('orange')
        .factory('PatientService', PatientService);

    PatientService.$inject = ['$q', '$state', '$ionicLoading', 'OrangeApi', '$localstorage',
        'BasePagingService', 'Avatar', 'errorList'];

    /* @ngInject */
    function PatientService($q, $state, $ionicLoading, OrangeApi, $localstorage, BasePagingService,
                            Avatar, errorList) {

        var Service = function () {
            BasePagingService.call(this);
            this.apiEndpoint = 'patients';
            this.currentPatient = null;
            this.limit = 30;

            this.errorItemNotFound = errorList.INVALID_PATIENT_ID;
            this.errorItemNotFoundText = 'Patient not found';
        };

        Service.prototype = Object.create(BasePagingService.prototype);
        Service.prototype.getItem = getItem;
        Service.prototype.getPatient = getPatient;
        Service.prototype.getHabits = getHabits;
        Service.prototype.setHabits = setHabits;
        Service.prototype.getTZName = getTZName;
        Service.prototype.setCurrentPatient = setCurrentPatient;

        // TODO: temporary alias
        Service.prototype.getPatients = Service.prototype.getItems;

        Service.prototype.changeStateByPatient = changeStateByPatient;
        Service.prototype.getReport = getReport;

        Service.prototype.clear = clear;
        Service.prototype.saveItem = saveItem;
        Service.prototype.setItem = setItem;
        Service.prototype.removeItem = removeItem;

        return new Service();


        function clear() {
            BasePagingService.prototype.clear.call(this);
            this.currentPatient = null;
            $localstorage.remove('currentPatient');
        }

        function getItem() {
            return BasePagingService.prototype.getItem.apply(this, arguments).then(
                function (item) {
                    setFullName(item);
                    return item;
                }
            );
        }

        function saveItem(savedItem) {
            var self = this,
                avatarUrl = savedItem.avatarUrl,
                parts = savedItem.fullName ? savedItem.fullName.split(' ') : [],
                isNew = !savedItem.id;

            savedItem.first_name = parts.shift() || savedItem.first_name;
            savedItem.last_name = parts.join(' ');
            savedItem.birthdate = savedItem.birthdate || null;
            if (savedItem.birthdate instanceof Date) {
                savedItem.birthdate = savedItem.birthdate.toJSON().slice(0, 10);
            }

            if (!isNew) {
                var listItem = _.find(this.items, function (item) {
                    return item.id == savedItem.id;
                });
                if (listItem) {
                    listItem.habits['wake'] = savedItem.habits['wake'];
                    listItem.habits['breakfast'] = savedItem.habits['breakfast'];
                    listItem.habits['dinner'] = savedItem.habits['dinner'];
                    listItem.habits['lunch'] = savedItem.habits['lunch'];
                    listItem.habits['sleep'] = savedItem.habits['sleep'];
                    listItem.habits.save();
                }
            }

            return BasePagingService.prototype.saveItem.call(this, savedItem).then(function (item) {
                console.log('Begin patient.saveItem callback');

                if (self.currentPatient === null || self.currentPatient.id == item.id) {
                    self.currentPatient = item;
                }

                setFullName(item);
                if (avatarUrl) {
                    item.avatarUrl = avatarUrl;
                    return Avatar.upload(item).then(function () {
                        console.log('Avatar callback');
                        if (!isNew) {
                            Avatar.cleanCache(item.id);
                        }
                        return item;
                    });
                }
                return item;
            });
        }

        function setItem(item) {
            BasePagingService.prototype.setItem.call(this, item);
            if (this.item) {
                setFullName(this.item);

                if (!this.item.habits) {
                    return this.setHabits(this.item);
                } else {
                    var deferred = $q.defer();
                    deferred.resolve(null);
                    return deferred.promise;
                }
            }
        }

        function removeItem(removedItem) {
            var isCurrent = this.currentPatient['id'] === removedItem.id,
                self = this;
            return BasePagingService.prototype.removeItem.call(this, removedItem).then(function (items) {
                if (isCurrent) {
                    $localstorage.remove('currentPatient');
                    self.currentPatient = null;
                    self.getPatient();
                }
                return items;
            });
        }

        function getPatient() {
            var self = this;
            //Get patient from cache
            if (this.currentPatient != null) {
                var deferred = $q.defer();
                deferred.resolve(this.currentPatient);
                return deferred.promise;
            }

            var patientID = $localstorage.get('currentPatient', null);

            $ionicLoading.show({
                template: 'Loading patient data...'
            });

            return this.getItems().then(

                function (patients) {
                    if (!patients.length) {
                        $ionicLoading.hide();
                        return;
                    }

                    var patient;
                    //Get patient by id
                    if (patientID) {
                        patient = _.find(patients, function (item) {
                            return item['id'] == patientID;
                        });
                        if (!patient) {
                            return OrangeApi.patients.get(patientID).then(
                                function (currentPatient) {
                                    $ionicLoading.hide();
                                    self.currentPatient = currentPatient;
                                    self.setHabits(currentPatient);
                                    return currentPatient;
                                },
                                errorGetPatient
                            );
                        }
                    }

                    if (!patient) {
                        patient = _.find(patients, function (item) {
                            return item['me'] === true;
                        });
                    }

                    if (patient === undefined && patients.length > 0) {
                        patient = patients[0];
                    }

                    patient && self.setCurrentPatient(patient);
                    self.setHabits(patient);
                    $ionicLoading.hide();
                    return patient;
                },
                errorGetPatients
            );

            function errorGetPatient(response) {
                console.log('Error response: ', response);
                $ionicLoading.hide();
                return null;
            }

            function errorGetPatients(response) {
                console.log('error get patients');
                console.log(response);
                $ionicLoading.hide();
                return null;
            }
        }

        function changeStateByPatient() {
            //Change state by patient
            return this.getPatient().then(function (patient) {
                 if (patient != null) {
                     patient.all('medications').getList({limit: 1}).then(function (medication) {
                         if (!_.isUndefined(medication[0])) {
                             $state.go('app.today.schedule');
                             return;
                         }
                         $state.go('logs');
                     });

                     return patient;
                 }
                 $state.go('logs');
            });
        }

        function setCurrentPatient(patient) {
            this.currentPatient = patient;
            this.setHabits(patient);
            $localstorage.set('currentPatient', patient['id']);
        }

        function getHabits(patient) {
            return patient.one('habits').get('');
        }

        function setHabits(patient) {
            var self = this;
            return this.getHabits(patient).then(function (habits) {
                if (!habits.tz || habits.tz === 'Etc/UTC') {
                    habits.tz = self.getTZName();
                }
                patient.habits = habits;
            });
        }

        function getReport(patientId, month, year) {
            var startDate = new Date(Date.UTC(year, month, 1)),
                endDate = new Date(Date.UTC(year, parseInt(month) + 1, 0));
            return OrangeApi.patients.withHttpConfig({
                responseType: 'arraybuffer'
            }).get(
                patientId + '.pdf', {
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0]
                }
            );
        }

        function setFullName(patient) {
            patient.fullName = patient.first_name + ' ' + patient.last_name;
        }

        function getTZName() {
            var tz = jstz.determine();
            var m = moment();
            return m.utcOffset()  === 360 ? 'Asia/Novosibirsk' : tz.name();
        }
    }
})();
