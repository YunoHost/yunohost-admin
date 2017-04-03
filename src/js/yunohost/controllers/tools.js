(function() {
    // Get application context
    var app = Sammy.apps['#main'];
    var store = app.store;

    /**
     * Tools
     *
     */

    // Tools list
    app.get('#/tools', function (c) {
        c.view('tools/tools_list');
    });

    // Update administration password
    app.get('#/tools/adminpw', function (c) {
        c.view('tools/tools_adminpw');
    });

    // Update administration password (PUT)
    app.put('#/tools/adminpw', function (c) {
        params = {};
        $.each(c.params.toHash(), function(key, value) {
            if (value !== '') { params[key] = value; }
        });
        if ($.isEmptyObject(params)) {
            c.flash('fail', y18n.t('error_modify_something'));
            store.clear('slide');
            c.redirect('#/tools/adminpw');
        } else if (params['new_password'] !== params['confirm_new_password']) {
            c.flash('fail', y18n.t('passwords_dont_match'));
            store.clear('slide');
            c.redirect('#/tools/adminpw');
        } else {
            c.api('/login', function(data) {
                // Remove useless variable
                delete params['old_password'];
                delete params['confirm_new_password'];

                // Update password and redirect to the home
                c.api('/adminpw', function(data) { // http://api.yunohost.org/#!/tools/tools_adminpw_put_3
                    c.redirect('#/logout');
                }, 'PUT', params);
            }, 'POST', { 'password': params['old_password'] }, false);
        }
    });

    // System update & upgrade
    app.get('#/update', function (c) {
        c.api('/update', function(data) {
            packagesLength = data.packages.length;
            for(var i = 0; i < packagesLength; i++) {
                data.packages[i].delayed = false;
                data.packages[i].changelog = data.packages[i].changelog.replace(/\n/g, '<br />');

                // Check for special packages that need delayed upgrade.
                if (["moulinette", "moulinette-yunohost", "yunohost-admin", "yunohost-config-nginx", "ssowat", "python"].indexOf(data.packages[i].name) != -1) {
                    c.flash('warning', y18n.t('system_delayed_upgrade_warning', [data.packages[i].name]));
                    data.packages[i].delayed = true;
                }
            }
            c.view('update/update', data);
        }, 'PUT');
    });

    // Upgrade apps or packages
    app.get('#/upgrade/:type', function (c) {
        if (c.params['type'] !== 'apps' && c.params['type'] !== 'packages') {
            c.flash('fail', y18n.t('unknown_argument', [c.params['type']]));
            store.clear('slide');
            c.redirect('#/update');
        }
        else {
            c.confirm(
                y18n.t('tools'),
                // confirm_update_apps and confirm_update_packages
                y18n.t('confirm_update_' + c.params['type'].toLowerCase()),
                function(){
                    endurl = '';
                    if (c.params['type'] == 'packages') {endurl = 'ignore_apps';}
                    else if (c.params['type'] == 'apps') {endurl = 'ignore_packages';}

                    c.api('/upgrade?'+endurl, function(data) {
                        // 'log' is a reserved name, maybe in handlebars
                        data.logs = data.log;
                        c.view('upgrade/upgrade', data);
                    }, 'PUT');

                },
                function(){
                    store.clear('slide');
                    c.redirect('#/update');
                }
            );
        }
    });

    // Download SSL Certificate Authority
    app.get('#/tools/ca', function (c) {
        c.view('tools/tools_ca');
    });

    // Security feed
    app.get('#/tools/security-feed', function (c) {
        data = {
            items: []
        };

        // Get security feed and display items
        var forumUrl = 'https://forum.yunohost.org';
        var securityUrl = 'https://forum.yunohost.org/c/security';
        var securityFeed = 'https://yunohost.org/security.rss';

        data.url = {
            web: securityUrl,
            rss: securityFeed
        };

        $.ajax({
            url: securityFeed,
            // dataType: (jQuery.browser.msie) ? "text" : "xml",
            dataType: "xml"
        })
        .done(function(xml){
            // Loop through items
            $('item', xml).each(function(k, v) {
                var link=$('link', v)[0].innerHTML;
                if (typeof link == 'string' && link !== '' && link.charAt(0) == '/')
                    link=forumUrl+link;
                var description=$('description', v)[0].textContent;
                description=description.replace('href="/','href="'+forumUrl+'/');

                var item = {
                    guid: $('guid', v)[0].innerHTML,
                    title: $('title', v)[0].innerHTML,
                    url: link,
                    desc: description,
                    date: $('pubDate', v)[0].innerHTML.split(' +')[0],
                };
                data.items.push(item);
            });

            c.view('tools/tools_security_feed', data);
        })
        .fail(function() {
            c.flash('fail', y18n.t('error_retrieve_feed', [securityFeed]));
        });

    });

    // Packages version
    app.get('#/tools/versions', function (c) {
        c.api('/version', function(versions) {
            c.view('tools/tools_versions', {'versions' : versions});
        });
    });

    // Diagnosis
    app.get('#/tools/diagnosis(/:private)?', function (c) {
        // See http://sammyjs.org/docs/routes for splat documentation
        private = (c.params.splat[0] == 'private');

        endurl = (private) ? '?private' : '';
        c.api('/diagnosis'+endurl, function(diagnosis) {
            c.view('tools/tools_diagnosis', {
                'diagnosis' : JSON.stringify(diagnosis, undefined, 4),
                'raw' : diagnosis,
                'private' : private
            });
        });
    });

})();