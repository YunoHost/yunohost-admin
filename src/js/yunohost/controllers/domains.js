(function() {
    // Get application context
    var app = Sammy.apps['#main'];
    var store = app.store;

    /**
     * Domains
     *
     */

    // List existing domains
    app.get('#/domains', function (c) {
        c.api('/domains', function(data) { // http://api.yunohost.org/#!/domain/domain_list_get_2
            c.api('/domains/main', function(data2) {
                domains = [];
                $.each(data.domains, function(k, domain) {
                    domains.push({
                        url: domain,
                        main: (domain == data2.current_main_domain) ? true : false
                    });
                });

                // Do not show main domain form if we have only 1 domain
                main_domain_form = (domains.length > 1) ? true: false;

                // Sort domains with main domain first
                domains.sort(function(a, b){ return -2*(a.main) + 1; });
                c.view('domain/domain_list', {domains: domains, main_domain_form: main_domain_form});
            }, 'PUT');
        });
    });

    // Add domain form
    app.get('#/domains/add', function (c) {
        $.get('https://dyndns.yunohost.org/domains', function() {})
            .done(function(data){
                c.params.ddomains = data.map(function(dom){return '.'+dom;});
            })
            .fail(function() {
                c.params.ddomains = ['.nohost.me', '.noho.st'];
            })
            .always(function() {
                data = {
                    ddomains : c.params.ddomains,
                    domains : c.params.domains,
                    allowDyndnsDomain : true
                };

                // Allow only 1 DynDns domain.
                var regex = data.ddomains.join('|');
                $.each(data.domains, function(k, domain) {
                    if ( domain.search(regex) > 0 ) {
                        data.allowDyndnsDomain = false;
                    }
                });

                c.view('domain/domain_add', data);
            });
    });

    // Add domain (POST)
    app.post('#/domains/add', function (c) {
        if (c.params['domain'] === '') {
            if (c.params['ddomain'] === '') {
                c.flash('fail', y18n.t('error_select_domain'));
                store.clear('slide');
                c.redirect('#/domains/add');
            }
            params = {'domain': c.params['ddomain'] + c.params['ddomain-ext']};
            endurl = 'dyndns';
        } else {
            params = { 'domain': c.params['domain'] };
            endurl = '';
        }

        c.api('/domains?'+endurl, function(data) { // http://api.yunohost.org/#!/domain/domain_add_post_1
            c.redirect('#/domains');
        }, 'POST', params);
    });

    // Remove existing domain
    app.get('#/domains/:domain/delete', function (c) {
        c.confirm(
            y18n.t('domains'),
            y18n.t('confirm_delete', [c.params['domain']]),
            function(){
                c.api('/domains/'+ c.params['domain'], function(data) { // http://api.yunohost.org/#!/domain/domain_remove_delete_3
                    store.clear('slide');
                    c.redirect('#/domains');
                }, 'DELETE');
            },
            function(){
                store.clear('slide');
                c.redirect('#/domains');
            }
        );
    });

    // Set default domain
    app.post('#/domains', function (c) {
        if (c.params['domain'] === '') {
            c.flash('fail', y18n.t('error_select_domain'));
            store.clear('slide');
            c.redirect('#/domains');
        } else {
            c.confirm(
                y18n.t('domains'),
                y18n.t('confirm_change_maindomain'),
                function(){
                    params = {'new_domain': c.params['domain']};
                    c.api('/domains/main', function(data) { // http://api.yunohost.org/#!/tools/tools_maindomain_put_1
                        store.clear('slide');
                        c.redirect('#/domains');
                    }, 'PUT', params);

                    // Wait 15s and refresh the page
                    refreshDomain = window.setTimeout(function(){
                        store.clear('slide');
                        c.redirect('#/domains');
                    }, 15000);
                },
                function(){
                    store.clear('slide');
                    c.redirect('#/domains');
                }
            );
        }
    });

})();