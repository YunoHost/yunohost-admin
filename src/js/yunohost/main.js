(function() {

        var app = Sammy('#main', function (sam) {


        /**
         * Application bootstrap
         *
         */
        sam.bind('run', function () {

            // Flash messages
            var flashMessage = $('#flashMessage');
            $('#toggle-btn', flashMessage).click(function(e) {
                flashMessage.toggleClass('open');
            });
            $('#clear-btn', flashMessage).click(function(e) {
                flashMessage.removeClass('open').find('.messages').html('');
                $('#slider').removeClass('with-flashMessage');
            });

        });


        /**
         * Sammy Configuration
         *
         */

        // Plugins
        sam.use('Handlebars', 'ms');

        Handlebars.registerHelper('ucwords', function(str) {
            return (str + '').replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function ($1) {
                return $1.toUpperCase();
            });
        });
        Handlebars.registerHelper('humanSize', function(bytes) {
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            if (bytes === 0) return 'n/a';
            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
            return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[[i]];
        });
        Handlebars.registerHelper('humanTime', function(time) {
            return Math.round(time) + 's';
        });
        Handlebars.registerHelper('bitRate', function(bytes, time) {
            var sizes = ['b', 'Kb', 'Mb', 'Gb', 'Tb'];
            if (time === 0) return 'n/a';
            var bps = bytes / time * 8;
            var i = parseInt(Math.floor(Math.log(bps) / Math.log(1024)));
            return Math.round(bps / Math.pow(1024, i), 2) + ' ' + sizes[[i]] + '/s';
        });

        Handlebars.registerHelper('t', function(y18n_key) {
          var result = y18n.t(y18n_key, Array.prototype.slice.call(arguments, 1));
          return new Handlebars.SafeString(result);
        });


        // Look for supported type of storage to use
        /**
         * http://sammyjs.org/docs/api/0.7.4/all#Sammy.Store.LocalStorage
         * LocalStorage is our favorite, as it allows multiple tabs
         */
        var storageType;
        if (Sammy.Store.isAvailable('local')) {
            storageType = 'local';
        } else if (Sammy.Store.isAvailable('session')) {
            storageType = 'session';
        } else if (Sammy.Store.isAvailable('cookie')) {
            storageType = 'cookie';
        } else {
            storageType = 'memory';
        }

        // Initialize storage
        sam.store = new Sammy.Store({name: 'storage', type: storageType});
        sam.loaded = false;
        sam.isInstalledTry = 3;


        /**
         * Errors
         */
        sam.notFound = function(){
            // Redirect to home page on 404.
            window.location = '#/';
        };

    });


    /**
     * Translations
     */
    $.getJSON('locales/en.json', function(data){
        y18n.translations['en'] = data;
        y18n.translateInlineHTML();
    });

    // User defined language
    if (window.navigator && window.navigator.language) {
        y18n.locale = window.navigator.language.substr(0, 2);
        if (y18n.locale !== 'en') {
            $.getJSON('locales/'+ y18n.locale +'.json', function(data){
                y18n.translations[y18n.locale] = data;
                y18n.translateInlineHTML();
            });
        }
    }


    /**
     * Run the application
     */
    $(document).ready(function () {
        // Run Sammy.js application
        app.run('#/');
    });

})();