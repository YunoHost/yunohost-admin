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
                c.redirect('#/login');
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
                c.params.ddomains = data.map(function(dom){return '.'+dom;});
            })
            .fail(function() {
                c.params.ddomains = ['.nohost.me', '.noho.st'];
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
                                store.clear('slide');
                                c.flash('fail', y18n.t('error_select_domain'));
                            } else {
                                domain = $('#ddomain').val() + $('select[name="ddomain-ext"]').val();
                            }
                        } else {
                            domain = $('#domain').val();
                        }
                        store.set('maindomain', domain);
                    });
                });
            });
    });

    // Step 3 : administration passowrd
    app.get('#/postinstall/password', function(c) {
        $('#masthead').hide();
        if (!store.get('maindomain')) {
            store.clear('slide');
            c.redirect('#/postinstall/domain');
        } else {
            c.view('postinstall/postinstall_3', { 'domain': store.get('maindomain').toLowerCase() });
        }
    });

    // Execute post-installation
    app.post('#/postinstall', function (c) {
        if (c.params['password'] === '' || c.params['confirmation'] === '') {
            c.flash('fail', y18n.t('password_empty'));
        }
        else if (c.params['password'] == c.params['confirmation']) {
            if (c.params['domain'] === '') {
                c.flash('fail', y18n.t('error_select_domain'));
                store.clear('slide');
                c.redirect('#/postinstall/domain');
            } else {
                params = { 'domain': c.params['domain'].toLowerCase() };
            }

            c.confirm(
                y18n.t('postinstall'),
                y18n.t('confirm_postinstall', [c.params['domain']]),
                function(){
                    params['password'] = c.params['password'];

                    store.set('url', window.location.hostname +'/yunohost/api');
                    store.set('user', 'admin');
                    c.api('/postinstall', function(data) { // http://api.yunohost.org/#!/tools/tools_postinstall_post_0
                        c.redirect('#/login');
                    }, 'POST', params);
                },
                function(){
                }
            );
        } else {
            c.flash('fail', y18n.t('passwords_dont_match'));
        }
    });

})();