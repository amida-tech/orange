(function () {
    'use strict';

    angular
        .module('orange')
        .factory('BasePagingService', BasePagingService)
        .factory('PatientPagingService', PatientPagingService);

    BasePagingService.$inject = ['$rootScope', '$q', 'OrangeApi'];
    PatientPagingService.$inject = ['BasePagingService', 'Patient'];

    /**
     * Base Paging service works through OrangeApi
     */
    function BasePagingService($rootScope, $q, OrangeApi) {
        var Service = function () {

            this.apiEndpoint = '';
            this.items = null;
            this.item = null;
            this.count = 0;
            this.offset = 0;
            this.limit = $rootScope.settings.defaultLimit;
            this.sortBy = 'id';
            this.sortOrder = 'asc';

            this.getItems = getItems;
            this.hasMore = hasMore;
            this.moreItems = moreItems;
            this.setItem = setItem;
            this.getItem = getItem;
            this.removeItem = removeItem;
            this.saveItem = saveItem;

            this.getNewItemPromise = getNewItemPromise;
            this.newItemSuccess = newItemSuccess;
            this.getFetchPromise = getFetchPromise;
            this.fetchItemsSuccess = fetchItemsSuccess;

            $rootScope.$on('auth:user:logout', clear.bind(this));
        };

        return Service;

        function initItems() {
            var self = this;
            this.offset = 0;
            return fetchItems.apply(this).then(function (items) {
                self.items = items;
                self.offset = self.limit;
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
                return initItems.apply(this);
            } else {
                var deferred = $q.defer();
                deferred.resolve(this.items);
                return deferred.promise;
            }
        }

        function fetchItems(options) {
            options = options || {};
            var opts = {
                    limit: options['limit'] || this.limit,
                    offset: options['offset'] || this.offset,
                    sort_by: options['sortBy'] || this.sortBy,
                    sort_order: options['sortOrder'] || this.sortOrder
                };

            return this.getFetchPromise(opts);
        }

        function getFetchPromise(options) {
            return OrangeApi[this.apiEndpoint].getList(options).then(this.fetchItemsSuccess);
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
            console.log('Set item ' + this.item.id);
        }

        function getItem() {
            return this.item;
        }
        
        function removeItem(removedItem){
            var self = this,
                itemIndex = this.items.indexOf(removedItem);
            return removedItem.remove().then(function () {
                if (itemIndex > -1) {
                    self.items.splice(itemIndex, 1);
                }
                self.count -= 1;
                self.offset -= 1;
                return self.items;
            });
        }

        function saveItem(savedItem) {
            if (savedItem.id) {
                return savedItem.save();
            } else {
                return this.getNewItemPromise(savedItem);
            }
        }
        
        function getNewItemPromise(savedItem) {
            return OrangeApi[this.apiEndpoint].post(savedItem).then(this.newItemSuccess.bind(this));
        }

        function newItemSuccess(newItem, addCondition) {
            if (addCondition === undefined) {
                addCondition = true;
            }
            if (!this.hasMore() && addCondition) {
                this.items[this.sortOrder !== 'desc' ? 'push' : 'unshift'](newItem);
                this.offset += 1;
            }
            this.count += 1;
            this.item = newItem;
        }
    }


    /**
     * Paging service for patient endpoints
     */
    function PatientPagingService(BasePagingService, Patient) {
        var Service = function () {
            BasePagingService.call(this);

            this.getNewItemPromise = getNewItemPromise;
            this.getFetchPromise = getFetchPromise;
        };
        Service.prototype = BasePagingService;

        return Service;


        function getNewItemPromise(savedItem) {
            var self = this;
            return Patient.getPatient().then(function (patient) {
                return patient.all(self.apiEndpoint).post(savedItem).then(
                    self.newItemSuccess.bind(self)
                );
            });
        }

        function getFetchPromise(options) {
            var self = this;
            return Patient.getPatient().then(function (patient) {
                return patient.all(self.apiEndpoint).getList(options).then(self.fetchItemsSuccess.bind(self));
            });
        }
    }
})();
