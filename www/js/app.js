angular.module('orange', ['ionic', 'restangular', 'ngMessages', 'ngCordova', 'base64'])

    .run(function ($ionicPlatform, Auth, $rootScope, $state) {

             // Initializing app
             $rootScope.initialized = false;
             Auth.init().then(function (status) {
                 $rootScope.initialized = true;

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
                        controller: 'MenuCtrl'
                    })
                    .state('app.today', {
                        url: '/today',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/app.today.html',
                                controller: 'TodayCtrl'
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
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/app.notes.html',
                                controller: 'NotesCtrl'
                            }
                        }
                    })
                    .state('app.note-view', {
                        url: '/notes/:id',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/app.notes.view.html',
                                controller: 'NotesCtrl'
                            }
                        }
                    })
                    .state('app.medications', {
                        url: '/medications',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/app.medications.html',
                                controller: 'MedicationsCtrl'
                            }
                        }
                    })
                    .state('app.doctors', {
                        url: '/doctors',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/app.doctors.html',
                                controller: 'DoctorsCtrl'
                            }
                        }
                    })
                    .state('app.pharmacies', {
                        url: '/pharmacies',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/app.pharmacies.html'
                            }
                        }
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
                    .state('logs-setup-habits', {
                        url: '/log/:logId/habits/',
                        templateUrl: 'templates/logs.setup.habits.html',
                        controller: 'LogHabitsCtrl',
                        resolve: {
                            'habits': ['OrangeApi', '$stateParams', function (OrangeApi, $stateParams) {
                                return OrangeApi.patients.all($stateParams.logId.toString()).one('habits').get('');
                            }]
                        }
                    })
                    .state('logs-setup-medications', {
                        url: '/log/:logId/medications',
                        templateUrl: 'templates/logs.setup.medications.html',
                        controller: 'MedicationsCtrl as meds'
                    })

                    .state('logs-setup-medications-search', {
                        url: '/onboarding/logs/setup/medications/search',
                        templateUrl: 'templates/logs.setup.medications.search.html',
                        controller: 'SearchMedicationCtrl'

                    })
                    .state('logs-setup-medications-schedule', {
                        url: '/onboarding/logs/setup/medications/schedule',
                        templateUrl: 'templates/logs.setup.medications.schedule.html',
                        controller: 'ComponentsCtrl'
                    })
                    .state('logs-setup-medications-events', {
                        url: '/onboarding/logs/setup/medications/events',
                        templateUrl: 'templates/logs.setup.medications.events.html',
                        controller: 'ComponentsCtrl'
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
