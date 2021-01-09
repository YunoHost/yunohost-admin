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
        req.api('GET', '/domains', {}, function(data) {
            req.params.domains = data.domains;
            req.params.domains_main = data.main;
        });
    }

    function prefetchUsers(req){
        // Preload users lists.
        req.params.users = [];
        req.api('GET', '/users', {}, function(data) {
            req.params.users = data.users;
        });
    }

    app.before(/domains\/add/, prefetchDomains);
    app.before(/apps\/install\//, prefetchDomains);
    app.before(/apps\/install\//, prefetchUsers);
    app.before(/apps\/install\/custom\//, prefetchDomains);
    app.before(/apps\/install\/custom\//, prefetchUsers);
    app.before(/apps\/\w+\/actions/, prefetchUsers);
    app.before(/apps\/\w+\/actions/, prefetchDomains);
    app.before(/apps\/\w+\/config-panel/, prefetchUsers);
    app.before(/apps\/\w+\/config-panel/, prefetchDomains);


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
