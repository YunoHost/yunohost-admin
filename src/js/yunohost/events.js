(function() {
    // Get application context
    var app = Sammy.apps['#main'];
    var store = app.store;

    /**
     * Events
     *
     */
    app.bind('login', function(e, data) {
        c.api('GET', '/users', {}, function(data) {
            // Warn admin if no users are created.
            if (typeof data.users !== 'undefined' && data.users.length === 0) {
                c.flash('warning', y18n.t('warning_first_user'));
            }

            c.api("GET", "/diagnosis/show?full", {}, function(data) {
                c.hideLoader();
                basesystem = data.reports.filter(function(r) { return r.id == "basesystem"; })[0];
                version_info = basesystem.items.filter(function(i) { return (i.meta && i.meta.test && i.meta.test == "ynh_versions"); })[0];
                $('#yunohost-version').html(y18n.t('footer_version', [version_info.data.main_version, version_info.data.repo]));
            });
        });
    });

    app.bind('logout', function(e, data) {
        $('#yunohost-version').empty();
    });


    // Konamicode ;P   up up down down left right left right b a
    var konami_code = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65],
    konami_step = 0;
    $(document).keydown(function (e) {
        if (e.keyCode === konami_code[konami_step++]) {
            if (konami_step === konami_code.length) {
                konami_step = 0;
                $('#main').addClass("with-nyancat");
                return false;
            }
        }
        else {
            konami_step = 0;
        }
    });

})();
