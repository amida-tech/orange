(function () {
    'use strict';

    angular
        .module('orange')
        .controller('TodayCtrl', TodayCtrl);

    TodayCtrl.$inject = ['$rootScope', '$q', '$scope', '$ionicLoading', '$ionicPopup', '$ionicModal', 'n2w', 'patient'];

    function TodayCtrl($rootScope, $q, $scope, $ionicLoading, $ionicPopup, $ionicModal, n2w, patient) {
        var vm = this;
        var doseModal = null;

        vm.schedule = null;
        vm.medications = null;
        vm.habits = null;

        vm.event = null;
        vm.dose = null;

        vm.filters = [
            {
                title: 'After Wake',
                name: '',
                f: function (elem) {
                    return elem.event &&
                        elem.event.type === 'event' &&
                        elem.event.when === 'after' &&
                        elem.event.event === 'sleep';
                },
                events: []
            },
            {
                title: 'Exact Time',
                name: '',
                f: function (elem) {
                    if ((elem.event && elem.event.type === 'exact') || (_.isUndefined(elem.notification))) {
                        var breakfast = moment(vm.habits.breakfast, 'HH:mm');
                        var time = moment(elem.date);
                        return time <= breakfast;
                    }

                    return false;

                },
                events: []

            },
            {
                title: 'Before Breakfast',
                name: '',
                f: function (elem) {
                    return elem.event &&
                        elem.event.type === 'event' &&
                        elem.event.when === 'before' &&
                        elem.event.event === 'breakfast';
                },
                events: []
            },
            {
                title: 'After Breakfast',
                name: '',
                f: function (elem) {
                    return elem.event &&
                        elem.event.type === 'event' &&
                        elem.event.when === 'after' &&
                        elem.event.event === 'breakfast';
                },
                events: []
            },
            {
                title: 'Exact Time',
                name: 'two hours ago',
                f: function (elem) {
                    if ((elem.event && elem.event.type === 'exact') || (_.isUndefined(elem.notification))) {
                        var breakfast = moment(vm.habits.breakfast, 'HH:mm');
                        var lunch = moment(vm.habits.lunch, 'HH:mm');
                        var time = moment(elem.date);
                        return (time > breakfast) && (time <= lunch);
                    }

                    return false;

                },
                events: []

            },
            {
                title: 'Before Lunch',
                name: '',
                f: function (elem) {
                    return elem.event &&
                        elem.event.type === 'event' &&
                        elem.event.when === 'before' &&
                        elem.event.event === 'lunch';
                },
                events: []
            },
            {
                title: 'After Lunch',
                name: '',
                f: function (elem) {
                    return elem.event &&
                        elem.event.type === 'event' &&
                        elem.event.when === 'after' &&
                        elem.event.event === 'lunch';
                },
                events: []
            },
            {
                title: 'Exact Time',
                name: '',
                f: function (elem) {
                    if ((elem.event && elem.event.type === 'exact') || (_.isUndefined(elem.notification))) {
                        var lunch = moment(vm.habits.lunch, 'HH:mm');
                        var dinner = moment(vm.habits.dinner, 'HH:mm');
                        var time = moment(elem.date);
                        return (time > lunch) && (time <= dinner);
                    }

                    return false;

                },
                events: []

            },
            {
                title: 'Before Dinner',
                name: '',
                f: function (elem) {
                    return elem.event &&
                        elem.event.type === 'event' &&
                        elem.event.when === 'before' &&
                        elem.event.event === 'dinner';
                },
                events: []
            },
            {
                title: 'After Dinner',
                name: '',
                f: function (elem) {
                    return elem.event &&
                        elem.event.type === 'event' &&
                        elem.event.when === 'after' &&
                        elem.event.event === 'dinner';
                },
                events: []
            },
            {
                title: 'Exact Time',
                name: '',
                f: function (elem) {
                    if ((elem.event && elem.event.type === 'exact') || (_.isUndefined(elem.notification))) {
                        var dinner = moment(vm.habits.dinner, 'HH:mm');
                        var time = moment(elem.date);
                        return (time > dinner);
                    }

                    return false;

                },
                events: []

            },
            {
                title: 'Before Sleep',
                name: '',
                f: function (elem) {
                    return elem.event &&
                        elem.event.type === 'event' &&
                        elem.event.when === 'before' &&
                        elem.event.event === 'sleep';
                },
                events: []
            }
        ];

        vm.refresh = refresh;
        vm.confirmDose = confirmDose;
        vm.openModal = showModal;
        vm.closeModal = hideModal;
        vm.createDose = createDose;

        refresh();

        $ionicModal.fromTemplateUrl('templates/partial/dose.today.modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            doseModal = modal
        });


        function createDose(skipped) {
            skipped = skipped || false;
            vm.dose.taken = !skipped;
            patient.all('doses').post(vm.dose).finally(function() {
                refresh();
                hideModal();
            });
        }

        function showModal(event) {
            if (!_.isUndefined(event.dose_id)) return;
            vm.event = event;
            vm.event.text = getEventText(event);
            vm.dose = {
                medication_id: event.medication_id,
                date: moment().format(),
                taken: true,
                scheduled: event.scheduled
            };
            doseModal.show();
        }

        function hideModal() {
            vm.event = null;
            vm.dose = null;
            doseModal.hide();
        }

        function confirmDose(event, skipped) {
            skipped = skipped || false;

            $ionicPopup.confirm({
                title: event.medication.name,
                template: '<p class="text-center">Mark this medication event as' + (skipped ? ' skipped': ' taken') + '?</p>',
                okText: '<b>Yes</b>',
                okType: 'button-dark-orange'
            }).then(
                function (confirm) {
                    if (confirm) {
                        var dose = {
                            medication_id: event.medication_id,
                            date: moment().format(),
                            taken: !skipped,
                            scheduled: event.scheduled
                        };
                        $ionicLoading.show({
                            template: 'Saving...'
                        });
                        patient.all('doses').post(dose).finally(function() {
                            refresh();
                        })
                    }
                });
        }

        function getEventText(event) {
            var result = '';
            result += _.capitalize(n2w.toWords(event.medication.dose.quantity || 0));
            result += ' unit' + (event.medication.dose.quantity === 1 ? '' : 's');
            if (event.event.type == 'exact') {
                result += ' at ' + event.event.time;
            } else {
                result += ' ' + event.event.when + ' ' + event.event.event;
            }
            if (event.take_with_food !== null) {
                result += ', taken ' + (event.take_with_food ? 'with': 'without') + ' food'
            }
            return result;
        }

        function getFilterName(events) {
            var result = '';
            if (events.length) {
                var first = moment(events[0].date);
                return first.fromNow();
            }
            return result;
        }

        function getEventStatus(event) {
            var status = 'active';
            if (!_.isUndefined(event.dose_id)) {
                status = event.took_medication ? 'taken' : 'skipped';
            }
            return status;
        }

        function refresh() {
            var date = moment();
            var filter = {
                //start_date: date.format('YYYY-MM-DD'),
                end_date: date.format('YYYY-MM-DD')
            };
            $q.all([
                patient.all('schedule').getList(filter),
                patient.all('medications').getList(),
                patient.one('habits').get('')
            ]).then(
                function (data) {
                    vm.schedule = data[0].plain();
                    vm.medications = data[1].plain();
                    vm.habits = data[2].plain();
                    vm.schedule.forEach(function (elem) {
                        elem.medication = _.find(vm.medications, {id: elem.medication_id});

                        if (!_.isUndefined(elem.scheduled)) {
                            elem.event = _.find(elem.medication.schedule.times, {id: elem.scheduled});
                        }
                        elem.status = getEventStatus(elem);
                    });

                    vm.filters.forEach(function (filter) {
                        filter.events = _.filter(vm.schedule, filter.f);
                        filter.name = getFilterName(filter.events);
                    })
                },
                function (error) {
                    console.log(error);
                }
            ).finally(
                function () {
                    $scope.$broadcast('scroll.refreshComplete');
                    $ionicLoading.hide();
                })
        }

        $rootScope.$on('$cordovaLocalNotification:click', function (ev, notification, state) {
            var event = JSON.parse(notification.data).event;
            event.medication = _.find(vm.medications, {id: event.medication_id});
            event.event = _.find(event.medication.schedule.times, {id: event.scheduled});
            console.log(event);
            showModal(event);
        })
    }
})();
