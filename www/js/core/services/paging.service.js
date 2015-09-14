(function () {
    'use strict';

    angular
        .module('orange')
        .factory('BasePagingService', BasePagingService)
        .factory('PatientPagingService', PatientPagingService);

    BasePagingService.$inject = ['$rootScope', '$q', '$state', 'OrangeApi', 'settings', 'GlobalService'];
    PatientPagingService.$inject = ['$rootScope', 'BasePagingService', 'PatientService'];

    /**
     * Base Paging service works through OrangeApi
     */
    function BasePagingService($rootScope, $q, $state, OrangeApi, settings, GlobalService) {
        var Service = function () {

            this.apiEndpoint = '';
            this.items = null;
            this.item = null;
            this.count = 0;
            this.offset = 0;
            this.limit = settings.defaultLimit;
            this.sortBy = 'id';
            this.sortOrder = 'asc';

            this.errorItemNotFound = '';
            this.errorItemNotFoundText = 'Item not found';
            this.afterErrorItemNotFoundState = '';

            $rootScope.$on('auth:user:logout', this.clear.bind(this));
        };

        Service.prototype.initItems = initItems;
        Service.prototype.getItems = getItems;
        Service.prototype.getAllItems = getAllItems;
        Service.prototype.sendListChanged = sendListChanged;
        Service.prototype.onListChanged = onListChanged;
        Service.prototype.hasMore = hasMore;
        Service.prototype.moreItems = moreItems;
        Service.prototype.setItem = setItem;
        Service.prototype.getItem = getItem;
        Service.prototype.getItemPromise = getItemPromise;
        Service.prototype.removeItem = removeItem;
        Service.prototype.excludeItemFromList = excludeItemFromList;
        Service.prototype.saveItem = saveItem;
        Service.prototype.clear = clear;

        Service.prototype.getNewItemPromise = getNewItemPromise;
        Service.prototype.newItemSuccess = newItemSuccess;
        Service.prototype.getFetchPromise = getFetchPromise;
        Service.prototype.fetchItemsSuccess = fetchItemsSuccess;

        return Service;

        function initItems(all, limit) {
            all = all || false;
            var self = this,
                options = {
                    limit: all ? limit || 0 : this.limit
                    //limit: all ? 0 : this.limit
                };
            this.offset = 0;
            this.count = 0;
            return fetchItems.call(this, options).then(function (items) {
                self.items = items;
                self.offset = all ? items.meta['count'] : self.limit;
                self.sendListChanged();
                return self.items;
            });
        }

        function clear() {
            this.items = null;
            this.item = null;
            this.count = 0;
            this.offset = 0;
        }

        function getItems(force) {
            force = force || false;
            if (this.items == null || force) {
                return this.initItems();
            } else {
                var deferred = $q.defer();
                deferred.resolve(this.items);
                return deferred.promise;
            }
        }

        function getAllItems(force) {
            // TODO: Uncommented this, when limit:0 will work for all services
            //if (force || this.count === 0 || this.count > this.offset) {
            //    return initItems.call(this, true);
            //} else {
            //    return this.getItems();
            //}
            var self = this;
            return fetchItems.call(this, {limit: 0}).then(function (response) {
                var count = response.meta['count'] || 0;
                if (count && (count > self.offset || force)) {
                    return self.initItems(true, count);
                } else {
                    return self.getItems();
                }
            });
        }

        function fetchItems(options) {
            options = options || {};
            var opts = {
                    limit: options['limit'] !== undefined ? options['limit'] : this.limit,
                    offset: options['offset'] !== undefined ? options['offset'] : this.offset,
                    sort_by: options['sortBy'] || this.sortBy,
                    sort_order: options['sortOrder'] || this.sortOrder
                };

            return this.getFetchPromise(opts);
        }

        function getFetchPromise(options) {
            return OrangeApi[this.apiEndpoint].getList(options).then(
                this.fetchItemsSuccess.bind(this)
            );
        }

        function fetchItemsSuccess(response) {
            this.count = response.meta['count'];
            return response;
        }

        function moreItems() {
            var self = this;
            if (this.hasMore()) {
                return fetchItems.call(this, {offset: this.offset}).then(
                    function (items) {
                        self.items = _.union(self.items, items);
                        self.offset += self.limit;
                        self.sendListChanged();
                        return self.items;
                    }
                )
            }
        }

        function hasMore() {
            return this.count === undefined || this.count > this.offset;
        }

        function setItem(item) {
            this.item = item;
            item && console.log('Set item ' + item['id']);
        }

        function getItem(itemId) {
            var deferred = $q.defer(),
                self = this;

            if (this.item && (this.item.id == itemId || itemId === undefined)) {
                deferred.resolve(this.item);
                return deferred.promise;
            } else if (!itemId) {
                deferred.resolve(null);
                return deferred.promise;
            } else {
                return this.getItemPromise(itemId).then(
                    undefined,
                    function (error) {
                        if (error.data.errors[0] === self.errorItemNotFound) {
                            onErrorNotFound.call(self, error);
                        }
                        return $q.reject(error);
                    }
                );
            }
        }

        function getItemPromise(itemId) {
            var self = this;
            return OrangeApi[this.apiEndpoint].get(itemId).then(function (item) {
                self.setItem(item);
                return item;
            })
        }

        function removeItem(removedItem) {
            var self = this;
            return removedItem.remove().then(
                function () {
                    self.excludeItemFromList(removedItem);
                    self.count -= 1;
                    self.offset -= 1;
                    self.sendListChanged();
                    return self.items;
                },
                function (error) {
                    if (error.data.errors[0] === self.errorItemNotFound) {
                        if (self.excludeItemFromList(removedItem)) {
                            self.count -= 1;
                            self.offset -= 1;
                        }
                        onErrorNotFound.call(self, error);
                    }
                    return $q.reject(error);
                }
            );
        }

        function excludeItemFromList(item) {
            var itemIndex = this.items ? this.items.indexOf(item) : -1;
            if (itemIndex > -1) {
                this.items.splice(itemIndex, 1);
                return true;
            }
            return false;
        }

        function saveItem(savedItem) {
            var self = this;
            if (savedItem.id) {
                return savedItem.save().then(
                    function (newItem) {
                        var listItem = _.find(self.items, function (item) {
                            return item.id === newItem.id;
                        });
                        listItem = _.extend(listItem, newItem);
                        if (listItem && listItem.id === self.item.id) {
                            self.setItem(listItem);
                        }
                        self.sendListChanged();
                        return listItem || newItem;
                    },
                    function (error) {
                        if (error.data.errors[0] === self.errorItemNotFound) {
                            if (self.excludeItemFromList(savedItem)) {
                                self.count -= 1;
                                self.offset -= 1;
                            }
                            onErrorNotFound.call(self, error);
                        }
                        return $q.reject(error);
                    }
                );
            } else {
                return this.getNewItemPromise(savedItem);
            }
        }

        function getNewItemPromise(savedItem) {
            return OrangeApi[this.apiEndpoint].post(savedItem).then(
                this.newItemSuccess.bind(this)
            );
        }

        function newItemSuccess(newItem, addCondition) {
            if (addCondition === undefined) {
                addCondition = true;
            }
            if (!this.hasMore() && addCondition && this.items) {
                this.items[this.sortOrder !== 'desc' ? 'push' : 'unshift'](newItem);
                this.offset += 1;
            }
            this.count += 1;
            this.item = newItem;
            this.sendListChanged();
            return newItem;
        }

        function onErrorNotFound(error) {
            var self = this;
            GlobalService.showError(this.errorItemNotFoundText).then(function () {
                self.setItem(null);
                self.afterErrorItemNotFoundState && $state.go(self.afterErrorItemNotFoundState);
            });
        }

        function sendListChanged() {
            $rootScope.$broadcast(this.apiEndpoint + ':items:changed', this.items);
        }

        function onListChanged(callback) {
            $rootScope.$on(this.apiEndpoint + ':items:changed', callback);
        }
    }


    /**
     * Paging service for patient endpoints
     */
    function PatientPagingService($rootScope, BasePagingService, PatientService) {
        var Service = function () {
            BasePagingService.call(this);
            $rootScope.$on('changePatient', this.clear.bind(this));
        };

        Service.prototype = Object.create(BasePagingService.prototype);
        Service.prototype.getNewItemPromise = getNewItemPromise;
        Service.prototype.getFetchPromise = getFetchPromise;
        Service.prototype.getItemPromise = getItemPromise;

        return Service;


        function getNewItemPromise(savedItem) {
            var self = this;
            return PatientService.getPatient().then(function (patient) {
                return patient.all(self.apiEndpoint).post(savedItem).then(
                    self.newItemSuccess.bind(self)
                );
            });
        }

        function getFetchPromise(options) {
            var self = this;
            return PatientService.getPatient().then(function (patient) {
                return patient.all(self.apiEndpoint).getList(options).then(
                    self.fetchItemsSuccess.bind(self)
                );
            });
        }

        function getItemPromise(itemId) {
            var self = this;
            return PatientService.getPatient().then(function (patient) {
                return patient.all(self.apiEndpoint).get(itemId).then(function (item) {
                    self.setItem(item);
                    return item;
                });
            });
        }
    }
})();
