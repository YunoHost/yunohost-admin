(function() {
    // Get application context
    var app = Sammy.apps['#main'];
    var store = app.store;


    /**
     * Filters
     *
     */

    function prefetchDomains(req) {
        // Preload domains list.
        req.params.domains = [];
        req.api('/domains', function(data) {
            req.params.domains = data.domains;
        });
    }

    function prefetchUsers(req){
        // Preload users lists.
        req.params.users = [];
        req.api('/users', function(data) {
            req.params.users = data.users;
        });
    }

    app.before(/domains\/add/, prefetchDomains);
    app.before(/apps\/install\//, prefetchDomains);
    app.before(/apps\/install\//, prefetchUsers);


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
