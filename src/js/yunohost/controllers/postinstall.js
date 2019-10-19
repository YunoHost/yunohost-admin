(function() {
    // Get application context
    var app = Sammy.apps['#main'];
    var store = app.store;

    /**
     * Post installation
     *
     */

    // Step 1 : introduction
    app.get('#/postinstall', function(c) {
        $('#masthead').hide();
        c.checkInstall(function(isInstalled) {
            if (isInstalled || typeof isInstalled === 'undefined') {
                c.redirect_to('#/login');
            } else {
                c.view('postinstall/postinstall_1');
            }
        });
    });

    // Step 2 : domain
    app.get('#/postinstall/domain', function(c) {
        $('#masthead').hide();
        $.get('https://dyndns.yunohost.org/domains', function() {})
            .done(function(data){
                c.params['ddomains'] = data.map(function(dom){return '.'+dom;});
            })
            .fail(function() {
                c.params['ddomains'] = ['.nohost.me', '.noho.st', '.ynh.fr'];
            })
            .always(function() {
                c.view('postinstall/postinstall_2', c.params, function() {
                    $('#domain, #ddomain').keyup(function(event){
                        if(event.keyCode == 13){
                            $('a.savedomain').click();
                        }
                    });
                    $('a.savedomain').on('click', function(e) {
                        if ($('#domain').val() === '') {
                            if ($('#ddomain').val() === '') {
                                e.preventDefault();
                                c.flash('fail', y18n.t('error_select_domain'));
                            } else {
                                domain = $('#ddomain').val() + $('select[name="ddomain-ext"]').val();
                            }
                        } else {
                            domain = $('#domain').val();
                        }
                        store.set('maindomain', domain);
                    });
                }, false); // We disable enableSlide because that causes some issues with accordion when using the 'previous' button
            });
    });

    // Step 3 : administration passowrd
    app.get('#/postinstall/password', function(c) {
        $('#masthead').hide();
        if (!store.get('maindomain')) {
            c.redirect_to('#/postinstall/domain');
        } else {
            c.view('postinstall/postinstall_3', { 'domain': store.get('maindomain').toLowerCase() },
                function() { },
                false); // We disable enableSlide because that causes some issues with accordion when using the 'previous' button
        }
    });

    // Execute post-installation
    app.post('#/postinstall', function (c) {

        var password = c.params['password'];
        var confirmation = c.params['confirmation'];
        var domain = c.params['domain'].toLowerCase();

        // Check password ain't empty
        if (password === '' || confirmation === '') {
            c.flash('fail', y18n.t('password_empty'));
            return;
        }

        // Check password matches confirmation
        if (password !== confirmation) {
            c.flash('fail', y18n.t('passwords_dont_match'));
            return;
        }

        // Check domain ain't empty...
        if (domain === '') {
            c.flash('fail', y18n.t('error_select_domain'));
            c.redirect_to('#/postinstall/domain', {slide: false});
            return;
        }

        // Ask confirmation to the user
        c.confirm(
            y18n.t('postinstall'),
            y18n.t('confirm_postinstall', [c.params['domain']]),
            // Start the actual postinstall process
            function(){
                store.set('url', window.location.hostname +'/yunohost/api');
                store.set('user', 'admin');
                c.api('POST', '/postinstall', {domain: domain, password: password}, function() {
                    c.redirect_to('#/login');
                });
            }
        );
    });

})();
