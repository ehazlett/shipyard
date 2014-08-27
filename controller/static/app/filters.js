'use strict';
function truncate(t) {
   if (t.length < 12) {
       return t;
   }
   return t.substring(0, 12);
}

angular.module('shipyard.filters', [])
    .filter('truncate', function () {
        return function (t) {
            if (t == undefined) {
                return "";
            }
            return truncate(t);
        };
    })
    .filter('formatEvent', function () {
        return function (e) {
            var evt = "";
            evt += e.type + " ";
            if (e.container != undefined) {
                evt += truncate(e.container.id) + " " + e.container.image.name + " ";
            } else if (e.engine != undefined) {
                evt += e.engine.id + " (" + e.engine.addr + ") ";
            } else {
                evt += e.info + " ";
            }
            return evt;
        };
    })
    .filter('eventCssClass', function () {
        return function (t) {
            var cls = "";
            switch(t) {
                case 'die':
                    cls = "off red";
                    break;
                case 'start':
                    cls = "checkmark green";
                    break;
                case 'create':
                    cls = "add blue";
                    break;
                case 'restart':
                    cls = "refresh blue";
                    break;
                case 'add-engine':
                    cls = "cloud upload green";
                    break;
                case 'remove-engine':
                    cls = "remove";
                    break;
                default:
                    cls = "text file"
            }
            return cls;
        };
    });
