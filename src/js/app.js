window.Vue = require('vue');

// const baguetteBox = require('baguettebox.js');


// const gallery = require('./components/gallery');

Vue.component('gallery', require('./components/Gallery.vue'));
// Vue.component('galleryimage', require('./components/GalleryImage.vue'));

const app = new Vue({
    el: '#root'
});

window.Event = new Vue();

(function (window, document, undefined) {

    'use strict';

    function DOMReady(fn) {
        if (document.readyState != 'loading'){
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    var GALLERY = {
        common: {
            init: function() {
                //gallery.init()
                // baguetteBox.run('.gallery');
            }
        }
    };

    var UTIL = {
        exec: function( controller, action ) {
            var ns = GALLERY,
                action = ( action === undefined ) ? "init" : action;

            if ( controller !== "" && ns[controller] && typeof ns[controller][action] == "function" ) {
                ns[controller][action]();
            }
        },

        init: function() {
            var body = document.body,
                controller = body.getAttribute( "data-controller" ),
                action = body.getAttribute( "data-action" );

            UTIL.exec( "common" );
            UTIL.exec( controller );
            UTIL.exec( controller, action );
        }
    };

    DOMReady(function () {

        DOMReady( UTIL.init );

    });

})(window, document);
