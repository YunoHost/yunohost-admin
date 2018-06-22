(function() {
    // Get application context
    var app = Sammy.apps['#main'];
    var store = app.store;

    /**
     * Events
     *
     */
    app.bind('login', function(e, data) {
        this.api('/version', function(versions) {
            $('#yunohost-version').html(y18n.t('footer_version', [versions.yunohost.version, versions.yunohost.repo]));
        });
    });

    app.bind('logout', function(e, data) {
        $('#yunohost-version').empty();
    });
})();
