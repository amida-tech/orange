(function () {
    'use strict';

    angular
        .module('orange')
        .factory('PagingService', PagingService);

    PagingService.$inject = ['$rootScope', '$q', 'Patient'];

    function PagingService($rootScope, $q, Patient) {
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

            this.newItemSuccess = newItemSuccess;

            $rootScope.$on('auth:user:logout', clear.bind(this));
        };

        return new Service();

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

        function fetchItems(offset, limit, sortBy, sortOrder) {
            var self = this,
                options = {
                    limit: limit || this.limit,
                    offset: offset || this.offset,
                    sort_by: sortBy || this.sortBy,
                    sort_order: sortOrder || this.sortOrder
                };
            return Patient.getPatient().then(function (patient) {
                return patient.all(self.apiEndpoint).getList(options).then(function (response) {
                    self.count = response.meta['count'];
                    return response;
                });
            });
        }

        function moreItems() {
            var self = this;
            if (this.hasMore()) {
                return fetchItems.apply(this, [this.offset]).then(
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
            var self = this;
            if (savedItem.id) {
                return savedItem.save();
            } else {
                return Patient.getPatient().then(function (patient) {
                    return patient.all(self.apiEndpoint).post(savedItem).then(
                        self.newItemSuccess.bind(self)
                    );
                });
            }
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
})();
