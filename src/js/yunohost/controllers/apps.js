(function() {
    // Get application context
    var app = Sammy.apps['#main'];
    var store = app.store;

    /**
     * Apps
     *
     */

    // List installed apps
    app.get('#/apps', function (c) {
        c.api('/apps', function(data) { // http://api.yunohost.org/#!/app/app_list_get_8
            // Keep only installed apps
            data2 = { 'apps': [], 'installed_apps': true };
            $.each(data['apps'], function(k, v) {
                if (v['installed']) data2['apps'].push(v);
            });

            c.arraySortById(data2.apps);
            c.view('app/app_list', data2);
        });
    });

    // List available apps
    app.get('#/apps/install', function (c) {
        c.api('/apps', function(data) { // http://api.yunohost.org/#!/app/app_list_get_8
            c.api('/apps?raw', function(dataraw) { // http://api.yunohost.org/#!/app/app_list_get_8
                // Keep only uninstalled apps, or multi-instance apps
                data2 = { 'apps': [], 'installed_apps': false };
                $.each(data['apps'], function(k, v) {
                    if ((!v['installed'] || dataraw[v['id']].manifest.multi_instance == "true") && !v['id'].match(/__[0-9]{1,5}$/)) {
                        v['install_link']=true;
                        data2['apps'].push(v);
                    }
                });

                // Sort app list
                c.arraySortById(data2.apps);
                c.view('app/app_list', data2);
            });
        });
    });

    // Refresh available apps list
    app.get('#/apps/refresh', function (c) {
        c.api('/appslists', function(data) { // http://api.yunohost.org/#!/app/app_fetchlist_put_5
            // c.redirect(store.get('path'));
            c.redirect('#/apps/install');
        }, 'PUT');
    });

    // Get app information
    app.get('#/apps/:app', function (c) {
        c.api('/apps/'+c.params['app']+'?raw', function(data) { // http://api.yunohost.org/#!/app/app_info_get_9
            // Presentation
            data.settings.allowed_users = (data.settings.allowed_users) ? data.settings.allowed_users.replace(',', ', ')+"." : y18n.t('everyone_has_access');

            // Multilingual description
            data.description = (typeof data.manifest.description[y18n.locale] !== 'undefined') ?
                        data.manifest.description[y18n.locale] :
                        data.manifest.description['en']
                        ;

            // Multi Instance settings
            data.manifest.multi_instance = (data.manifest.multi_instance == 'true') ? y18n.t('yes') : y18n.t('no');

            // Installation date
            var d = new Date(data.settings.install_time * 1000);
            data.install_time = d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();

            c.view('app/app_info', data);
        });
    });

    // Get app debug page
    app.get('#/apps/:app/debug', function (c) {
        c.api('/apps/'+c.params['app']+'/debug', function(data) {
            c.view('app/app_debug', data);
        });
    });

    // Special case for custom app installation.
    app.get('#/apps/install/custom', function (c) {
        // If we try to GET /apps/install/custom, it means that installation fail.
        // Need to redirect to apps/install to get rid of pacamn and see the log.
        c.redirect('#/apps/install');
    });

    // Helper function that build app installation form
    app.helper('appInstallForm', function(appId, manifest, params) {
        data = {
            id: appId,
            manifest: manifest
        };

        if (typeof data.manifest.arguments.install !== 'undefined') {
            $.each(data.manifest.arguments.install, function(k, v) {

                // Default values
                data.manifest.arguments.install[k].type = (typeof v.type !== 'undefined') ? v.type : 'string';
                data.manifest.arguments.install[k].inputType = 'text';
                data.manifest.arguments.install[k].required = (typeof v.optional !== 'undefined' && v.optional == "true") ? '' : 'required';
                data.manifest.arguments.install[k].attributes = "";

                // Input with choices becomes select list
                if (typeof data.manifest.arguments.install[k].choices !== 'undefined') {
                    // Update choices values with  key and checked data
                    $.each(data.manifest.arguments.install[k].choices, function(ck, cv){
                        data.manifest.arguments.install[k].choices[ck] = {
                            value: cv,
                            label: cv,
                            selected: (cv == data.manifest.arguments.install[k].default) ? true : false,
                        };
                    });
                }

                // Special case for domain input.
                // Display a list of available domains
                if (v.name == 'domain' || data.manifest.arguments.install[k].type == 'domain') {
                    data.manifest.arguments.install[k].choices = [];
                    $.each(params.domains, function(key, domain){
                        data.manifest.arguments.install[k].choices.push({
                            value: domain,
                            label: domain,
                            selected: false
                        });
                    });
                    data.manifest.arguments.install[k].help = "<a href='#/domains'>"+y18n.t('manage_domains')+"</a>";
                }

                // Special case for admin / user input.
                // Display a list of available users
                if (v.name == 'admin' || data.manifest.arguments.install[k].type == 'user') {
                    data.manifest.arguments.install[k].choices = [];
                    $.each(params.users, function(username, user){
                        data.manifest.arguments.install[k].choices.push({
                            value: username,
                            label: user.fullname+' ('+user.mail+')',
                            selected: false
                        });
                    });
                    data.manifest.arguments.install[k].help = "<a href='#/users'>"+y18n.t('manage_users')+"</a>";
                }

                // 'app' type input display a list of available apps
                if (data.manifest.arguments.install[k].type == 'app') {
                    data.manifest.arguments.install[k].choices = [];
                    $.each(params.apps, function(key, app){
                        data.manifest.arguments.install[k].choices.push({
                            value: app.id,
                            label: app.name,
                            selected: false
                        });
                    });
                    data.manifest.arguments.install[k].help = "<a href='#/apps'>"+y18n.t('manage_apps')+"</a>";
                }

                // Boolean fields
                if (data.manifest.arguments.install[k].type == 'boolean') {
                    data.manifest.arguments.install[k].inputType = 'checkbox';

                    // Checked or not ?
                    if (typeof data.manifest.arguments.install[k].default !== 'undefined') {
                        if (data.manifest.arguments.install[k].default == "True" || data.manifest.arguments.install[k].default == "1") {
                            data.manifest.arguments.install[k].attributes = 'checked="checked"';
                        }
                    }

                    // 'default' is used as value, so we need to force it for checkboxes.
                    data.manifest.arguments.install[k].default = 1;
                }

                // 'password' type input.
                if (v.name == 'password' || data.manifest.arguments.install[k].type == 'password') {
                    // Change html input type
                    data.manifest.arguments.install[k].inputType = 'password';
                }


                // Multilingual label
                data.manifest.arguments.install[k].label = (typeof data.manifest.arguments.install[k].ask[y18n.locale] !== 'undefined') ?
                                    data.manifest.arguments.install[k].ask[y18n.locale] :
                                    data.manifest.arguments.install[k].ask['en']
                                    ;
            });
        }

        // Multilingual description
        data.description = (typeof data.manifest.description[y18n.locale] !== 'undefined') ?
                                data.manifest.description[y18n.locale] :
                                data.manifest.description['en']
                                ;

        // Multi Instance settings boolean to text
        data.manifest.multi_instance = (data.manifest.multi_instance == 'true') ? y18n.t('yes') : y18n.t('no');

        // View app install form
        c.view('app/app_install', data);
        return;
    });

    // App installation form
    app.get('#/apps/install/:app', function (c) {
        c.api('/apps?raw', function(data) { // http://api.yunohost.org/#!/app/app_list_get_8

            c.appInstallForm(
                c.params['app'],
                data[c.params['app']].manifest,
                c.params
            );

        });
    });

    // Install app (POST)
    app.post('#/apps', function(c) {
        // Warn admin if app is going to be installed on domain root.
        if (c.params['path'] !== '/' || confirm(y18n.t('confirm_install_domain_root', [c.params['domain']]))) {
            params = { 'label': c.params['label'], 'app': c.params['app'] };
            delete c.params['label'];
            delete c.params['app'];
            params['args'] = c.serialize(c.params.toHash());
            // Do not pass empty args.
            if (params['args'] === "") {
                delete params['args'];
            }

            c.api('/apps', function() { // http://api.yunohost.org/#!/app/app_install_post_2
                c.redirect('#/apps');
            }, 'POST', params);
        }
        else {
            c.flash('warning', y18n.t('app_install_cancel'));
            store.clear('slide');
            c.redirect('#/apps/install');
        }
    });

    // Install custom app from github
    app.post('#/apps/install/custom', function(c) {

        params = { 'label': c.params['label'], 'app': c.params['url'] };
        delete c.params['label'];
        delete c.params['url'];

        c.confirm(
            y18n.t('applications'),
            y18n.t('confirm_install_custom_app'),
            function(){

                // Force trailing slash
                params.app = params.app.replace(/\/?$/, '/');

                // Get manifest.json to get additional parameters
                jQuery.ajax({
                    url: params.app.replace('github.com', 'raw.githubusercontent.com') + 'master/manifest.json',
                    type: 'GET',
                })
                .done(function(manifest) {
                    // raw.githubusercontent.com serve content as plain text
                    manifest = jQuery.parseJSON(manifest) || {};

                    c.appInstallForm(
                        params.app,
                        manifest,
                        c.params
                    );

                })
                .fail(function(xhr) {
                    c.flash('fail', y18n.t('app_install_custom_no_manifest'));
                    store.clear('slide');
                    c.redirect('#/apps/install');
                });
            },
            function(){
                c.flash('warning', y18n.t('app_install_cancel'));
                store.clear('slide');
                c.redirect('#/apps/install');
            }
        );
    });

    // Remove installed app
    app.get('#/apps/:app/uninstall', function (c) {
        c.confirm(
            y18n.t('applications'),
            y18n.t('confirm_uninstall', [c.params['app']]),
            function() {
                c.api('/apps/'+ c.params['app'], function() { // http://api.yunohost.org/#!/app/app_remove_delete_4
                    c.redirect('#/apps');
                }, 'DELETE');
            },
            function() {
                store.clear('slide');
                c.redirect('#/apps/'+ c.params['app']);
            }
        );
    });

    // Manage app access
    app.get('#/apps/:app/access', function (c) {
        c.api('/apps/'+c.params['app']+'?raw', function(data) { // http://api.yunohost.org/#!/app/app_info_get_9
            c.api('/users', function(dataUsers) {

                // allowed_users as array
                if (typeof data.settings.allowed_users !== 'undefined') {
                    if (data.settings.allowed_users.length === 0) {
                        // Force empty array, means no user has access
                        data.settings.allowed_users = [];
                    }
                    else {
                        data.settings.allowed_users = data.settings.allowed_users.split(',');
                    }
                } else {
                    data.settings.allowed_users = []; // Force array
                    // if 'allowed_users' is undefined, everyone has access
                    // that means that undefined is different from empty array
                    data.settings.allow_everyone = true;
                }

                // Available users
                data.users = [];
                $.each(dataUsers.users, function(username, user){
                    // Do not list allowed_users in select list
                    if ( data.settings.allowed_users.indexOf(username) === -1 ) {
                        data.users.push({
                            value: username,
                            label: user.fullname+' ('+user.mail+')'
                        });
                    } else {
                        // Complete allowed_users data
                        data.settings.allowed_users[data.settings.allowed_users.indexOf(username)] = {
                            username: username,
                            fullname: user.fullname,
                            mail: user.mail,
                        };
                    }
                });

                c.view('app/app_access', data);
            });
        });
    });

    // Remove all access
    app.get('#/apps/:app/access/remove', function (c) {
        c.confirm(
            y18n.t('applications'),
            y18n.t('confirm_access_remove_all', [c.params['app']]),
            function() {
                params = {'apps': c.params['app'], 'users':[]};
                c.api('/access?'+c.serialize(params), function(data) { // http://api.yunohost.org/#!/app/app_removeaccess_delete_12
                    store.clear('slide');
                    c.redirect('#/apps/'+ c.params['app']+ '/access');
                }, 'DELETE', params);
            },
            function() {
                store.clear('slide');
                c.redirect('#/apps/'+ c.params['app']+ '/access');
            }
        );
    });

    // Remove access to a specific user
    app.get('#/apps/:app/access/remove/:user', function (c) {
        c.confirm(
            y18n.t('applications'),
            y18n.t('confirm_access_remove_user', [c.params['app'], c.params['user']]),
            function() {
                params = {'apps': c.params['app'], 'users': c.params['user']};
                c.api('/access?'+c.serialize(params), function(data) { // http://api.yunohost.org/#!/app/app_removeaccess_delete_12
                    store.clear('slide');
                    c.redirect('#/apps/'+ c.params['app']+ '/access');
                }, 'DELETE', params); // passing 'params' here is useless because jQuery doesn't handle ajax datas for DELETE requests. Passing parameters through uri.
            },
            function() {
                store.clear('slide');
                c.redirect('#/apps/'+ c.params['app']+ '/access');
            }
        );
    });

    // Grant all access
    app.get('#/apps/:app/access/add', function (c) {
        c.confirm(
            y18n.t('applications'),
            y18n.t('confirm_access_add', [c.params['app']]),
            function() {
                params = {'apps': c.params['app'], 'users': null};
                c.api('/access', function() { // http://api.yunohost.org/#!/app/app_addaccess_put_13
                    store.clear('slide');
                    c.redirect('#/apps/'+ c.params['app'] +'/access');
                }, 'PUT', params);
            },
            function() {
                store.clear('slide');
                c.redirect('#/apps/'+ c.params['app']+ '/access');
            }
        );
    });

    // Grant access for a specific user
    app.post('#/apps/:app/access/add', function (c) {
        params = {'users': c.params['user'], 'apps': c.params['app']};
        c.api('/access', function() { // http://api.yunohost.org/#!/app/app_addaccess_put_13
            store.clear('slide');
            c.redirect('#/apps/'+ c.params['app'] +'/access');
        }, 'PUT', params);
    });

    // Clear access (reset)
    app.get('#/apps/:app/access/clear', function (c) {
        c.confirm(
            y18n.t('applications'),
            y18n.t('confirm_access_clear', [c.params['app']]),
            function() {
                params = {'apps': c.params['app']};
                c.api('/access', function() { //
                    store.clear('slide');
                    c.redirect('#/apps/'+ c.params['app'] +'/access');
                }, 'POST', params);
            },
            function() {
                store.clear('slide');
                c.redirect('#/apps/'+ c.params['app']+ '/access');
            }
        );
    });

    // Make app default
    app.get('#/apps/:app/default', function (c) {
        c.confirm(
            y18n.t('applications'),
            y18n.t('confirm_app_default'),
            function() {
                c.api('/apps/'+ c.params['app']  +'/default', function() { //
                    store.clear('slide');
                    c.redirect('#/apps/'+ c.params['app']);
                }, 'PUT');
            },
            function() {
                store.clear('slide');
                c.redirect('#/apps/'+ c.params['app']);
            }
        );
    });

})();