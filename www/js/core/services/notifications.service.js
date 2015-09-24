(function () {
    'use strict';

    angular
        .module('orange')
        .factory('notifications', notifications);

    notifications.$inject = ['$rootScope', '$q', '$timeout', '$state',
        '$cordovaLocalNotification', '$ionicPopup', 'PatientService', '$localstorage'];

    /* @ngInject */
    function notifications($rootScope, $q, $timeout, $state,
                           $cordovaLocalNotification, $ionicPopup, PatientService, $localstorage) {
        var id = 0;
        var stackAlerts = [];
        var clickFlag = false;

        $rootScope.$on('$cordovaLocalNotification:click', _clickNotifyEvent);
        $rootScope.$on('$cordovaLocalNotification:trigger', _triggerNotifyEvent);
        $rootScope.$on('auth:user:logout', clearNotify);

        $rootScope.$on('onResume', function(ev) {
            $rootScope.appOpen = true;
        });
        $rootScope.$on('onPause', function(ev) {
            $rootScope.appOpen = false;
        });

        return {
            updateNotify: updateNotify,
            clearNotify: clearNotify,
            addNotifyByMedication: addNotifyByMedication
        };

        ////////////////

        //Update notifications
        function updateNotify(force) {
            if (force === true) {
                $localstorage.remove('triggeredEvents');
            }
            if (!($rootScope.isIOS || $rootScope.isAndroid)) {
                return;
            }

            function _cancelCurrent() {
                var patient = PatientService.getPatient();
                patient.then(_fetchPatientData);

                var triggeredEvents = $localstorage.getObject('triggeredEvents');
                $cordovaLocalNotification.getAllIds().then(function(ids) {
                    var clearIds = ids;
                    if (!_.isUndefined(triggeredEvents)) {
                        clearIds = _.filter(ids, function(id) {
                            return _.isUndefined(_.find(triggeredEvents, function(event) {
                                return event.id == id
                            }))
                        });
                    }

                    $cordovaLocalNotification.clear(clearIds);
                    $cordovaLocalNotification.cancel(clearIds).then(function() {
                    });
                });
            }

            if ($rootScope.isAndroid) {
                _cancelCurrent();
                return;
            }

            $cordovaLocalNotification.hasPermission().then(function(result) {
                if (!result) {
                    var registerPromise = $cordovaLocalNotification.promptForPermission();
                    registerPromise.then(function() {
                        updateNotify();
                    });
                    return;
                }

                _cancelCurrent();
            });
        }

        function _fetchPatientData(patient) {
            var schedulePromise = patient.all('schedule').getList({
                end_date: moment().date(moment().date() + 1).format('YYYY-MM-DD')
            });
            var medPromise = patient.all('medications').getList();

            $q.all([medPromise, schedulePromise]).then(function(data) {
                var medications = data[0];
                var schedule = data[1];
                _scheduleNotify(medications, schedule);
            });
        }

        function _scheduleNotify(medications, schedule) {
            var notifyArray = [];
            _.each(schedule, function(item) {
                var date = moment(item.date);
                if (date < moment() || !_.isUndefined(item.dose_id)) {
                    return;
                }

                //Check medication
                var medication = _.find(medications, function(med) {
                    return med.id == item.medication_id
                });

                if (_.isUndefined(medication)) {
                    return;
                }

                //Check if already triggered
                if (_checkTriggered(item)) {
                    return;
                }

                //Set Text
                var messageText = 'You need to take ' + medication.name + ' at ' +
                    moment(item.date).format('hh:mm A');

                var data = {
                    event: item,
                    id: id
                };

                var schDate = new Date(item.notification);
                var scheduleOptions = {
                    id: id,
                    title: 'Take at ' + moment(item.date).format('hh:mm A'),
                    text: messageText,
                    at: schDate,
                    data: JSON.stringify(data)
                };

                //Combine notify by date
                notifyArray.push(scheduleOptions);
                //if ($rootScope.isAndroid) {
                //    $cordovaLocalNotification.schedule(scheduleOptions)
                //}

                id++;
            });
            //Schedule
            //if ($rootScope.isIOS) {
            _schNotify(notifyArray);
            //}
        }

        function _checkTriggered(event) {
            var triggeredEvents = $localstorage.getObject('triggeredEvents');
            return !_.isUndefined(_.find(triggeredEvents, function(triggered) {
                return triggered.date == event.date &&
                    triggered.scheduled == event.scheduled &&
                    triggered.medication_id == event.medication_id
            }))
        }

        function _schNotify(notifications) {
            if (!_.isUndefined(notifications[0])) {
                var notify = notifications.shift();
                $cordovaLocalNotification.schedule(notify).finally(function() {
                    $timeout(function() {
                        _schNotify(notifications);
                    });
                }, 5)
            }
        }

        //Clear All Notifications
        function clearNotify() {
            if (!($rootScope.isIOS || $rootScope.isAndroid)) {
                return;
            }

            $cordovaLocalNotification.clearAll();
            $cordovaLocalNotification.cancelAll();
        }

        function addNotifyByMedication(medication) {
            if (!($rootScope.isIOS || $rootScope.isAndroid)) {
                return;
            }

            var patient = PatientService.getPatient();
            patient.then(function(pat) {
                pat.all('schedule').getList({
                    medication_id: medication.id,
                    end_date: moment().date(moment().date() + 1).format('YYYY-MM-DD')
                }).then(function(schedule) {
                    _scheduleNotify([medication], schedule)
                });
            })
        }

        function _clickNotifyEvent (ev, notification, state) {
            clickFlag = true;
            $cordovaLocalNotification.clear([notification.id]);

            if (!$rootScope.initialized) {
                $rootScope.$watch('initialized', function(newValue, oldValue) {
                    if (newValue) {
                        $state.go('app.today.schedule');

                        //Success init today listener
                        var stateChangeEvent = $rootScope.$on('$stateChangeSuccess',  function(event, toState, toParams, fromState, fromParams) {
                            if (toState.name == 'app.today.schedule') {
                                //Delay for init today
                                $timeout(function() {
                                    $rootScope.$broadcast('today:click:notification', notification);
                                });
                                //Remove Event
                                stateChangeEvent();
                            }
                        })
                    }

                });
                return;
            }

            $state.go('app.today.schedule');
            $timeout(function() {
                $rootScope.$broadcast('today:click:notification', notification);
            }, 1000);
        }

        function _triggerNotifyEvent (ev, notification, state) {
            if (_checkTriggered(JSON.parse(notification.data).event)) {
                return;
            }

            if ($rootScope.isIOS && $rootScope.appOpen) {
                var notifyAlertObject = {
                    title: notification.title,
                    template: notification.text,
                    okType: 'button-dark-orange',
                    okText: 'Ok',
                    cancelText: 'Cancel'
                };

                if (!clickFlag) {
                    _notificationAlert(notifyAlertObject);
                }

                clickFlag = false;
            }

            var event = JSON.parse(notification.data).event;
            var triggered = [{
                id: notification.id,
                date: event.date,
                scheduled: event.scheduled,
                medication_id: event.medication_id
            }];

           var triggeredEvents = $localstorage.getObject('triggeredEvents');
            if (_.isUndefined(triggeredEvents)) {
                $localstorage.setObject('triggeredEvents', triggered);
                return;
            }
            $localstorage.setObject('triggeredEvents', _.union(triggered, triggeredEvents));
        }

        //Alert in ios open app
        function _notificationAlert(alertObj) {
            if ($ionicPopup._popupStack.length) {
                stackAlerts.push(alertObj);
                return;
            }

            var alertPromise = $ionicPopup.confirm(alertObj);
            alertPromise.then(_alertConfirm);
        }
        function _alertConfirm(confirm) {
            if (stackAlerts.length) {
                var alertObj = stackAlerts.shift();
                var alertPromise = $ionicPopup.confirm(alertObj);
                alertPromise.then(_alertConfirm);
            }

            if (confirm && $state.name != 'app.today.schedule') {
                $state.go('app.today.schedule');
            }
        }
    }

})();

