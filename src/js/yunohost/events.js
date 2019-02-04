(function() {
    // Get application context
    var app = Sammy.apps['#main'];
    var store = app.store;

    /**
     * Events
     *
     */
    app.bind('login', function(e, data) {
    });

    app.bind('logout', function(e, data) {
        $('#yunohost-version').empty();
    });
})();
