angular.module('orange', ['ionic', 'restangular', 'ngMessages', 'ngCordova', 'issue-9128-patch'])

    .run(function ($rootScope, $state, $ionicPlatform, $ionicHistory, Auth) {

             // Initializing app
             $rootScope.initialized = false;
             Auth.init().then(function (status) {
                 $rootScope.initialized = true;
                 $ionicHistory.nextViewOptions({
                     disableBack: true,
                     historyRoot: true
                 });
                 if (status === true) {
                     // User authorized
                     if ($rootScope.cachedState) {
                         $state.go($rootScope.cachedState.toState.name, $rootScope.cachedState.toParams);
                     } else {
                         $state.go('logs');
                     }
                 } else {
                     // Not authorized
                     $state.go('onboarding');
                 }
             });

             $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                 if (!$rootScope.initialized && toState.name !== 'loading') {
                     $rootScope.cachedState = {
                         toState: toState,
                         toParams: toParams
                     };
                     event.preventDefault();
                     $state.go('loading');
                 } else if ($rootScope.initialized && toState.name === 'loading') {
                     event.preventDefault();
                 }
             });

             $ionicPlatform.ready(function () {
                 // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                 // for form inputs)
                 $rootScope.isAndroid = ionic.Platform.isAndroid();
                 $rootScope.isIOS = ionic.Platform.isIOS();
                 if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                     //    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                     cordova.plugins.Keyboard.disableScroll(true);
                     //
                 }
                 //if (window.StatusBar) {
                 //    // org.apache.cordova.statusbar required
                 //    StatusBar.styleLightContent();
                 //}
             });
     })

    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, OrangeApiProvider, settings) {

                // Config Orange API
                OrangeApiProvider.setBaseUrl(settings.orangeApiUrl);
                OrangeApiProvider.setClientSecret(settings.clientSecret);


                $ionicConfigProvider.backButton.previousTitleText('').text('').icon('ion-arrow-left-c');
                // Native scrolling on Android
                // $ionicConfigProvider.platform.android.scrolling.jsScrolling(false);

                // Ionic uses AngularUI Router which uses the concept of states
                // Learn more here: https://github.com/angular-ui/ui-router
                // Set up the various states which the app can be in.
                // Each state's controller can be found in controllers.js
                $stateProvider
                    .state('loading', {
                        url: '/loading',
                        templateUrl: 'templates/loading.html'
                    })
                    .state('app', {
                        url: '/app',
                        abstract: true,
                        templateUrl: 'templates/app.menu.html',
                        controller: 'MenuCtrl',
                        resolve: {
                            log: ['OrangeApi', '$q', function (OrangeApi, $q) {
                                var deffered = $q.defer();
                                OrangeApi.patients.getList().then(
                                    function (patients) {
                                        var result = {};
                                        //patients = patients.plain();
                                        for (var i = 0, len = patients.length; i < len; i++) {
                                            var patient = patients[i];
                                            if (patient.me) {
                                                result = patient;
                                                break;
                                            }
                                        }
                                        deffered.resolve(result);
                                    },
                                    function (error) {
                                        deffered.resolve({})
                                    }
                                );
                                return deffered.promise;
                            }]
                        }
                    })
                    .state('app.today', {
                        url: '/today',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/app.today.html',
                                controller: 'TodayCtrl as today'
                            }
                        }
                    })
                    .state('app.components', {
                        url: '/components',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/app.components.html',
                                controller: 'ComponentsCtrl'
                            }
                        }
                    })
                    .state('app.notes', {
                        url: '/notes',
                        abstract: true,
                        views: {
                            menuContent: {
                                template: '<ion-nav-view/>',
                                controller: function($scope, $ionicLoading, log) {
                                    $scope.medications = log.all('medications').getList();
                                    $scope.notes = log.all('journal').getList({sort_order: 'desc', sort_by: 'date'});
                                }
                            }
                        }
                    })
                    .state('app.notes.list', {
                        url: '',
                        templateUrl: 'templates/app.notes.html',
                        controller: 'NotesCtrl as notes_list',
                        cache: false
                    })

                    .state('app.notes.details', {
                        url: '/:id/details',
                        templateUrl: 'templates/app.notes.details.html',
                        controller:'NoteDetailsCtrl as note_details',
                        cache: false
                    })
                    .state('app.notes.add', {
                        url: '/add',
                        templateUrl: 'templates/app.notes.add.html',
                        controller: 'NoteAddCtrl as notes_add'
                    })
                    .state('app.notes.update', {
                        url: '/:id/update',
                        templateUrl: 'templates/app.notes.add.html',
                        controller: 'NoteAddCtrl as notes_add'
                    })
                    .state('app.medications', {
                        url: '/medications',
                        abstract: true,
                        views: {
                            'menuContent': {
                                template: '<ion-nav-view></ion-nav-view>'
                            }
                        }
                    })
                    .state('app.medications.list', {
                        url: '',
                        templateUrl: 'templates/app.medications.html',
                        controller: 'MedicationsCtrl as medications'
                    })
                    .state('app.medications.details', {
                        url: '/:id/details',
                        templateUrl: 'templates/app.medications.details.html',
                        controller: 'MedicationCtrl as medication'
                    })
                    .state('app.doctors', {
                        url: '/doctors',
                        abstract: true,
                        views: {
                            'menuContent': {
                                template: '<ion-nav-view></ion-nav-view>',
                                controller: function($scope, log) {
                                    $scope.doctorToAdd = null;
                                    $scope.doctors = log.all('doctors').getList();
                                }
                            }
                        }

                    })
                    .state('app.doctors.list', {
                        url: '',
                        templateUrl: 'templates/app.doctors.html',
                        controller: 'DoctorsCtrl as doctors',
                        cache: false
                    })
                    .state('app.doctors.search', {
                        url: '/search',
                        templateUrl: 'templates/app.doctors.search.html',
                        controller: 'DoctorSearchCtrl as doctorSearch'
                    })
                    .state('app.doctors.details', {
                        url: '/:id/details',
                        templateUrl: 'templates/app.doctors.details.html',
                        controller: 'DoctorDetailsCtrl as doctorDetails'
                    })
                    .state('app.doctors.add', {
                        url: '/add',
                        templateUrl: 'templates/app.doctors.add.html',
                        controller: 'DoctorCtrl as doctor',
                        cache: false
                    })
                    .state('app.doctors.edit', {
                        url: '/:id/edit',
                        templateUrl: 'templates/app.doctors.add.html',
                        controller: 'DoctorCtrl as doctor',
                        cache: false
                    })
                    .state('app.pharmacies', {
                        url: '/pharmacies',
                        abstract: true,
                        views: {
                            'menuContent': {
                                template: '<ion-nav-view></ion-nav-view>',
                                controller: function ($scope, $ionicLoading, log) {
                                    $scope.pharmacies = log.all('pharmacies').getList();
                                }
                            }
                        }
                    })
                    .state('app.pharmacies.list', {
                        url: '',
                        templateUrl: 'templates/app.pharmacies.html',
                        controller: 'PharmaciesCtrl as pharmacies',
                        cache: false
                    })
                    .state('app.pharmacies.add', {
                        url: '/add',
                        templateUrl: 'templates/app.pharmacies.add.html',
                        controller: 'PharmacyAddCtrl as pharmacies_add'
                    })
                    .state('app.pharmacies.edit', {
                        url: '/edit/:id',
                        templateUrl: 'templates/app.pharmacies.add.html',
                        controller: 'PharmacyAddCtrl as pharmacies_add'
                    })
                    .state('app.pharmacies.details', {
                        url: '/details/:id',
                        templateUrl: 'templates/app.pharmacies.details.html',
                        controller: 'PharmacyDetailsCtrl as pharmacy_details'
                    })
                    .state('app.logs', {
                        url: '/logs',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/app.logs.html'
                            }
                        }
                    })
                    .state('app.notifications', {
                        url: '/notifications',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/app.notifications.html'
                            }
                        }
                    })
                    .state('app.settings', {
                        url: '/settings',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/app.settings.html'
                            }
                        }
                    })
                    .state('logs', {
                        url: '/onboarding/logs',
                        templateUrl: 'templates/logs.html',
                        controller: 'LogsCtrl',
                        cache: false,
                        resolve: {
                            'logs': ['OrangeApi', function (OrangeApi) {
                                return OrangeApi.patients.getList();
                            }]
                        }
                    })
                    .state('logs-add', {
                        url: '/onboarding/logs/add',
                        templateUrl: 'templates/logs.add.html',
                        controller: 'AddLogCtrl',
                        resolve: {
                            log: function () {
                                return {};
                            }
                        }
                    })
                    .state('logs-add-my', {
                        url: '/onboarding/logs/add/my',
                        templateUrl: 'templates/logs.add.html',
                        controller: 'AddLogCtrl',
                        resolve: {
                            log: ['OrangeApi', '$q', function (OrangeApi, $q) {
                                var deffered = $q.defer();
                                OrangeApi.patients.getList().then(
                                    function (patients) {
                                        var result = {};
                                        //patients = patients.plain();
                                        for (var i = 0, len = patients.length; i < len; i++) {
                                            var patient = patients[i];
                                            if (patient.me) {
                                                result = patient;
                                                break;
                                            }
                                        }
                                        deffered.resolve(result);
                                    },
                                    function (error) {
                                        deffered.resolve({})
                                    }
                                );
                                return deffered.promise;
                            }]
                        }
                    })
                    .state('logs-request', {
                        url: '/onboarding/logs/request',
                        templateUrl: 'templates/logs.request.html',
                        cache: false,
                        controller: 'RequestLogsCtrl'
                    })
                    .state('logs-setup', {
                        url: '/onboarding/logs/setup',
                        templateUrl: 'templates/logs.setup.html',
                        cache: false,
                        controller: 'LogsCtrl',
                        resolve: {
                            'logs': ['OrangeApi', function (OrangeApi) {
                                return OrangeApi.patients.getList();
                            }]
                        }
                    })

                    .state('onboarding-log', {
                        url: '/onboarding/log/:id',
                        abstract: true,
                        template: '<ion-nav-view></ion-nav-view>',
                        resolve: {
                            log: ['$stateParams', 'OrangeApi', function($stateParams, OrangeApi) {
                                var id = $stateParams.id;
                                return OrangeApi.patients.get(id);
                            }]
                        }
                    })
                    .state('onboarding-log.habits', {
                        url: '/habits/',
                        templateUrl: 'templates/logs.setup.habits.html',
                        controller: 'LogHabitsCtrl as habits',
                        resolve: {
                            'habits': ['log', function (log) {
                                return log.one('habits').get('');
                            }]
                        }
                    })
                    .state('onboarding-log.medications', {
                        url: '/medications',
                        abstract: true,
                        template: '<ion-nav-view></ion-nav-view>',
                        templateUrl: 'templates/logs.setup.medications.html',
                        controller: 'LogMedicationsCtrl as meds',
                        cache: false,
                        resolve: {
                            medications: ['log', function(log) {
                                return log.all('medications').getList();
                            }]
                        }
                    })

                    .state('onboarding-log.medications.list', {
                        url: '',
                        templateUrl: 'templates/logs.setup.medications.html'
                    })

                    .state('onboarding-log.medications.search', {
                        url: '/search',
                        templateUrl: 'templates/logs.setup.medications.search.html'
                    })

                    .state('onboarding-log.medications.schedule', {
                        url: '/schedule',
                        templateUrl: 'templates/logs.setup.medications.schedule.html'
                    })
                    .state('onboarding-log.medications.events', {
                        url: '/events',
                        templateUrl: 'templates/logs.setup.medications.events.html'
                    })
                    .state('logs-setup-medications-review', {
                        url: '/onboarding/logs/setup/medications/events',
                        templateUrl: 'templates/logs.setup.medications.review.html'
                    })

                    .state('account-create', {
                        url: '/onboarding/signup',
                        templateUrl: 'templates/account_create.html',
                        controller: 'AccountCtrl'
                    })
                    .state('account-login', {
                        url: '/login',
                        templateUrl: 'templates/account_login.html',
                        controller: 'AccountCtrl'
                    })
                    .state('onboarding', {
                        url: '/onboarding',
                        templateUrl: 'templates/onboarding.html'
                    });

                // if none of the above states are matched, use this as the fallback
                $urlRouterProvider.otherwise('/loading');

            });
