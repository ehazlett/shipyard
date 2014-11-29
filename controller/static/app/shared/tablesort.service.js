(function() {
    'use strict';

    angular
        .module('shipyard.shared')
        .factory('tablesort', tablesort);

    function tablesort() {
        var sortField = "";
        var reverseSort = false;

        function sortBy(field) {
            if(sortField == field) {
                reverseSort = !reverseSort;
            } else {
                sortField = field;
            }
        }

        function setReverseSort(reverse) {
            reverseSort = reverse;
        }

        function semanticHeaderClass(field) {
            if(field != sortField) {
                return "";
            }
            if(reverseSort == false) {
                return "ascending";
            } else {
                return "descending";
            }
        }

        function isReverseSorted() {
            return reverseSort;
        }

        function getSortField() {
            return sortField;
        }

        var service = {
            sortBy: sortBy,
            semanticHeaderClass: semanticHeaderClass,
            isReverseSorted: isReverseSorted,
            getSortField: getSortField,
            setReverseSort: setReverseSort,
        };

        return service;
    }

})()
