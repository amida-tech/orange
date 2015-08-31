(function () {
    'use strict';

    angular
        .module('orange')
        .factory('PagingService', PagingService);

    PagingService.$inject = ['$rootScope', '$q', 'Patient'];

    function PagingService($rootScope, $q, Patient) {
        var Service = function () {

            this.apiUrl = '';
            this.items = null;
            this.item = null;
            this.count = 0;
            this.offset = 0;
            this.limit = $rootScope.settings.defaultLimit;
            this.sortBy = 'id';
            this.sortOrder = 'asc';

            this.getItems = getItems;
            this.isInfinite = isInfinite;
            this.moreItems = moreItems;
            this.setItem = setItem;
            this.getItem = getItem;
            this.removeItem = removeItem;
            this.saveItem = saveItem;

        };

        return new Service();

        function initItems() {
            var that = this;
            this.offset = 0;
            return fetchItems.apply(this).then(function (items) {
                that.items = items;
                that.offset = that.limit;
                return that.items;
            });
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
            var that = this,
                options = {
                    limit: limit || this.limit,
                    offset: offset || this.offset,
                    sort_by: sortBy || this.sortBy,
                    sort_order: sortOrder || this.sortOrder
                };
            return Patient.getPatient().then(function (patient) {
                return patient.all(that.apiUrl).getList(options).then(function (response) {
                    that.count = response.meta['count'];
                    return response;
                });
            });
        }

        function moreItems() {
            var that = this;
            if (isInfinite.apply(this)) {
                return fetchItems.apply(this, [this.offset]).then(
                    function (items) {
                        that.items = _.union(that.items, items);
                        that.offset += that.limit;
                        return that.items;
                    }
                )
            }
        }

        function isInfinite() {
            return this.count === undefined || this.count > this.offset;
        }

        function setItem(item) {
            this.item = item;
        }

        function getItem() {
            return this.item;
        }
        
        function removeItem(removedItem){
            var that = this;
            return removedItem.remove().then(function () {
                _.remove(that.items, function (item) {
                    return removedItem.id == item.id;
                });
                that.count -= 1;
                that.offset -= 1;
                return that.items;
            });
        }

        function saveItem(savedItem) {
            var that = this;
            if (savedItem.id) {
                return savedItem.save();
            } else {
                return Patient.getPatient().then(function (patient) {
                    return patient.all(that.apiUrl).post(savedItem).then(
                        function (newItem) {
                            if (!isInfinite.apply(that)) {
                                that.items[that.sortOrder !== 'desc' ? 'push' : 'unshift'](newItem);
                                that.offset += 1;
                            }
                            that.count += 1;
                        }
                    );
                });
            }
        }
    }
})();
