(function() {
    // Get application context
    var app = Sammy.apps['#main'];
    var store = app.store;


    /**
     * Filters
     *
     */
    app.before(/domains\/add/, function (req){
        // Preload domains list.
        req.params.domains = [];
        req.api('/domains', function(data) {
            req.params.domains = data.domains;
        });
    });
    app.before(/apps\/install\//, function (req){
        // Preload domains list.
        req.params.domains = [];
        req.api('/domains', function(data) {
            req.params.domains = data.domains;
        });
    });
    app.before(/apps\/install\//, function (req){
        // Preload users lists.
        req.params.users = [];
        req.api('/users', function(data) {
            req.params.users = data.users;
        });
    });


    app.before({except: {path: ['#/logout', '#/login', '#/postinstall', '#/postinstall/domain', '#/postinstall/password']}}, function (req) {
        // Store path for further redirections
        store.set('path-1', store.get('path'));
        store.set('path', req.path);

        // Redirect to login page if no credentials stored
        if (!store.get('connected')) {
            req.redirect('#/login');
            return false;
        }
    });

    app.after(function () {});

})();