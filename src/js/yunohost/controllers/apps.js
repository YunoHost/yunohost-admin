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
        c.api('/apps?installed', function(data) { // http://api.yunohost.org/#!/app/app_list_get_8
            var apps = data['apps'];
            c.arraySortById(apps);
            c.view('app/app_list', {apps: apps});
        });
    });

    function levelToColor(level) {
        if (level >= 3) {
            return 'success';
        }
        else if (level >= 1) {
            return 'warning';
        }
        else if (isNaN(level)) {
            return 'default';
        } else {
            return 'danger'
        }
    }

    function stateToColor(state) {
        if (state === "working" || state === "official") {
            return 'success';
        }
        else {
            return 'danger';
        }
    }

    function combineColors(stateColor, levelColor, installable) {
        if (stateColor === "danger" || levelColor === "danger") {
            return 'danger';
        }
        else if (stateColor === "warning" || levelColor === "warning" || levelColor === "default") {
            return 'warning';
        }
        else
        {
            return 'success';
        }
    }

    // List available apps
    app.get('#/apps/install', function (c) {
        c.api('/apps', function (data) { // http://api.yunohost.org/#!/app/app_list_get_8
            c.api('/apps?raw', function (dataraw) { // http://api.yunohost.org/#!/app/app_list_get_8
                var apps = []
                $.each(data['apps'], function(k, v) {
                    if (dataraw[v['id']]['state'] === "validated")
                    {
                        dataraw[v['id']]['state'] = "official";
                    }
                    var state = dataraw[v['id']]['state'];
                    var levelFormatted = parseInt(dataraw[v['id']]['level']);
                    var isWorking = (state === 'working' || state === 'official') && levelFormatted > 0;
                    // Keep only the first instance of each app and remove community not working apps
                    if (!v['id'].match(/__[0-9]{1,5}$/) && (dataraw[v['id']]['repository'] === 'yunohost' || state !== 'notworking')) {

                        dataraw[v['id']]['installable'] = (!v['installed'] || dataraw[v['id']].manifest.multi_instance)
                        dataraw[v['id']]['isCommunity'] = !(dataraw[v['id']]['repository'] === 'yunohost');
                        dataraw[v['id']]['levelFormatted'] = isNaN(levelFormatted) ? '?' : levelFormatted;
                        dataraw[v['id']]['levelColor'] = levelToColor(levelFormatted);
                        dataraw[v['id']]['stateColor'] = stateToColor(state);
                        dataraw[v['id']]['installColor'] = combineColors(dataraw[v['id']]['stateColor'], dataraw[v['id']]['levelColor']);
                        dataraw[v['id']]['displayLicense'] = (dataraw[v['id']]['manifest']['license'] !== undefined
                                                              && dataraw[v['id']]['manifest']['license'] !== 'free');
                        dataraw[v['id']]['updateDate'] = dataraw[v['id']]['lastUpdate'] * 1000 || 0;
                        dataraw[v['id']]['isSafe'] = (dataraw[v['id']]['installColor'] !== 'danger');
                        dataraw[v['id']]['isWorking'] = isWorking ? "isworking" : "notFullyWorking";

                        jQuery.extend(dataraw[v['id']], v);
                        apps.push(dataraw[v['id']]);
                    }
                });

                // Sort app list
                c.arraySortById(apps);

                // setup filtering of apps once the view is loaded
                function  setupFilterEvents () {
                    // Uses plugin isotope to filter apps (we could had ordering to)
                    var cardGrid = jQuery('.grid').isotope({
                      itemSelector: '.app-card',
                      layoutMode: 'fitRows',
                      transitionDuration: 200
                    });

                    filterByClassAndName = function () {
                      var input = jQuery("#filter-app-cards").val().toLowerCase();
                      var inputMatch = (jQuery(this).find('.app-title').text().toLowerCase().indexOf(input) > -1);

                      var filterClass = jQuery("#dropdownFilter").attr("data-filter");
                      var classMatch = (filterClass === '*') ? true : jQuery(this).hasClass(filterClass);
                      return inputMatch && classMatch;
                    },

                    // Keep only official apps at first render
                    cardGrid.isotope({ filter: '.isworking' });

                    jQuery('.dropdownFilter').on('click', function() {
                        // change dropdown label
                        jQuery('#app-cards-list-filter-text').text(jQuery(this).find('.menu-item').text());
                         // change filter attribute
                        jQuery('#dropdownFilter').attr("data-filter", jQuery(this).attr("data-filter"));
                        // filter !
                        cardGrid.isotope({ filter: filterByClassAndName });
                    });

                    jQuery("#filter-app-cards").on("keyup", function() {
                        cardGrid.isotope({ filter: filterByClassAndName });
                    });
                }; 

                // render
                c.view('app/app_list_install', {apps: apps}, setupFilterEvents);

            });
        });
    });

    // List available apps lists
    app.get('#/apps/lists', function (c) {
        c.api('/appslists', function(data) {
            list = [];
            var has_community_list = false;
            $.each(data, function(listname, listinfo) {
                list.push({
                    'name': listname,
                    'url': listinfo['url'],
                    'lastUpdate': listinfo['lastUpdate']
                });

                // Check for community list
                if (listname == 'community' || listinfo['url'] == 'https://app.yunohost.org/community.json') {
                    has_community_list = true;
                }
            });

            c.view('app/app_appslists_list', {
                appslists: list,
                has_community_list: has_community_list
            });
        }, 'GET');
    });

    // Add a new apps list
    app.post('#/apps/lists', function (c) {
        list = {
            'name' : c.params['appslist_name'],
            'url' : c.params['appslist_url']
        }

        c.api('/appslists', function(data) {
            store.clear('slide');
            c.redirect('#/apps/lists/' + list.name);
        }, 'PUT', list);
    });

    // Show appslist info and operations
    app.get('#/apps/lists/:appslist', function (c) {
        c.api('/appslists', function(data) {
            if (typeof data[c.params['appslist']] !== 'undefined') {
                list = {
                    'name' : c.params['appslist'],
                    'url': data[c.params['appslist']]['url'],
                    'lastUpdate': data[c.params['appslist']]['lastUpdate'],
                    'removable' : (c.params['appslist'] !== 'yunohost') ? true : false // Do not remove default apps list
                };
                c.view('app/app_appslists_info', {appslist: list});
            }
            else {
                c.flash('warning', y18n.t('appslists_unknown_list', [c.params['appslist']]));
                store.clear('slide');
                c.redirect('#/apps/lists');
            }
        }, 'GET');
    });

    // Refresh available apps list
    app.get('#/apps/lists/refresh', function (c) {
        c.api('/appslists', function(data) {
            // c.redirect(store.get('path'));
            c.redirect('#/apps/install');
        }, 'PUT');
    });

    // Refresh specific apps list
    app.get('#/apps/lists/:appslist/refresh', function (c) {
        c.api('/appslists', function(data) {
            c.redirect('#/apps/lists');
        }, 'PUT', {'name' : c.params['appslist']});
    });

    // Remove apps list
    app.get('#/apps/lists/:appslist/remove', function (c) {
        c.confirm(
            y18n.t('appslist'),
            y18n.t('appslists_confirm_remove', [c.params['app']]),
            function() {
                c.api('/appslists', function() {
                    c.redirect('#/apps/lists');
                }, 'DELETE', {'name' : c.params['appslist']});
            },
            function() {
                store.clear('slide');
                c.redirect('#/apps/lists/'+ c.params['appslist']);
            }
        );
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
            data.manifest.multi_instance = data.manifest.multi_instance ? y18n.t('yes') : y18n.t('no');
            data.install_time = new Date(data.settings.install_time * 1000);

            c.view('app/app_info', data);
        });
    });

    // Get app debug page
    app.get('#/apps/:app/debug', function (c) {
        c.api('/apps/'+c.params['app']+'/debug', function(data) {
            c.view('app/app_debug', data);
        });
    });

    // Get app actions list
    app.get('#/apps/:app/actions', function (c) {
        c.api('/apps/'+c.params['app']+'/actions', function(data) {
            $.each(data.actions, function(_, action) {
                formatYunoHostStyleArguments(action.arguments, c.params);

                // Multilingual description
                action.description = (typeof action.description[y18n.locale] !== 'undefined') ?
                                        action.description[y18n.locale] :
                                        action.description['en']
                                        ;

            });

            c.view('app/app_actions', data);
            return;
        });
    });

    // Perform application
    app.put('#/apps/:app/actions/:action', function(c) {
        // taken from app install
        $.each(c.params, function(k, v) {
            if (typeof(v) === 'object' && Array.isArray(v)) {
                // And return only first value
                c.params[k] = v[0];
            }
        });

        var app_id = c.params['app'];
        delete c.params['app'];
        var action_id = c.params['action'];
        delete c.params['action'];

        var params = {
            'args': c.serialize(c.params.toHash())
        }

        c.api('/apps/'+app_id+'/actions/'+action_id, function() { // http://api.yunohost.org/#!/app/app_install_post_2
            c.redirect('#/apps/'+app_id+'/actions');
        }, 'PUT', params);
    });

    // Get app config panel
    app.get('#/apps/:app/config-panel', function (c) {
        c.api('/apps/'+c.params['app']+'/config-panel', function(data) {
            c.view('app/app_config-panel', data);
        });
    });

    app.post('#/apps/:app/config', function(c) {
        // taken from app install
        $.each(c.params, function(k, v) {
            if (typeof(v) === 'object' && Array.isArray(v)) {
                // And return only first value
                c.params[k] = v[0];
            }
        });

        var app_id = c.params['app'];
        delete c.params['app'];

        var params = {
            'args': c.serialize(c.params.toHash())
        }

        c.api('/apps/'+app_id+'/config', function() { // http://api.yunohost.org/#!/app/app_install_post_2
            c.redirect('#/apps/'+app_id+'/config-panel');
        }, 'POST', params);
    })

    // Special case for custom app installation.
    app.get('#/apps/install/custom', function (c) {
        // If we try to GET /apps/install/custom, it means that installation fail.
        // Need to redirect to apps/install to get rid of pacamn and see the log.
        c.redirect('#/apps/install');
    });

    // Helper function that formats YunoHost style arguments for generating a form
    function formatYunoHostStyleArguments(args, params) {
        if (!args) {
            return;
        }

        // this is in place modification, I don't like it but it was done this way
        $.each(args, function(k, v) {

            // Default values
            args[k].type = (typeof v.type !== 'undefined') ? v.type : 'string';
            args[k].inputType = 'text';
            args[k].isPassword = false;
            args[k].isDisplayText = false;
            args[k].required = (typeof v.optional !== 'undefined' && v.optional == "true") ? '' : 'required';
            args[k].attributes = "";
            args[k].helpText = "";
            args[k].helpLink = "";

            // Multilingual label
            args[k].label = (typeof args[k].ask[y18n.locale] !== 'undefined') ?
                                args[k].ask[y18n.locale] :
                                args[k].ask['en']
                                ;

            // Multilingual help text
            if (typeof args[k].help !== 'undefined') {
                args[k].helpText = (typeof args[k].help[y18n.locale] !== 'undefined') ?
                                    args[k].help[y18n.locale] :
                                    args[k].help['en']
                                    ;
            }

            // Input with choices becomes select list
            if (typeof args[k].choices !== 'undefined') {
                // Update choices values with key and checked data
                var choices = []
                $.each(args[k].choices, function(ck, cv){
                    // Non key/value choices have numeric key, that we don't want.
                    if (typeof ck == "number") {
                        // Key is Value in this case.
                        ck = cv;
                    }

                    choices.push({
                        value: ck,
                        label: cv,
                        selected: (ck == args[k].default) ? true : false,
                    });
                });
                args[k].choices = choices;
            }

            // Special case for domain input.
            // Display a list of available domains
            if (v.name == 'domain' || args[k].type == 'domain') {
                args[k].choices = [];
                $.each(params.domains, function(key, domain){
                    args[k].choices.push({
                        value: domain,
                        label: domain,
                        selected: false
                    });
                });

                // Custom help link
                args[k].helpLink += "<a href='#/domains'>"+y18n.t('manage_domains')+"</a>";
            }

            // Special case for admin / user input.
            // Display a list of available users
            if (v.name == 'admin' || args[k].type == 'user') {
                args[k].choices = [];
                $.each(params.users, function(username, user){
                    args[k].choices.push({
                        value: username,
                        label: user.fullname+' ('+user.mail+')',
                        selected: false
                    });
                });

                // Custom help link
                args[k].helpLink += "<a href='#/users'>"+y18n.t('manage_users')+"</a>";
            }

            // 'app' type input display a list of available apps
            if (args[k].type == 'app') {
                args[k].choices = [];
                $.each(params.apps, function(key, app){
                    args[k].choices.push({
                        value: app.id,
                        label: app.name,
                        selected: false
                    });
                });

                // Custom help link
                args[k].helpLink += "<a href='#/apps'>"+y18n.t('manage_apps')+"</a>";
            }

            // Boolean fields
            if (args[k].type == 'boolean') {
                args[k].inputType = 'checkbox';

                // Checked or not ?
                if (typeof args[k].default !== 'undefined') {
                    if (args[k].default == true) {
                        args[k].attributes = 'checked="checked"';
                    }
                }

                // 'default' is used as value, so we need to force it for checkboxes.
                args[k].default = 1;

                // Checkbox should not be required to be unchecked
                args[k].required = '';

                // Clone a hidden input with empty value
                // https://stackoverflow.com/questions/476426/submit-an-html-form-with-empty-checkboxes
                var inputClone = {
                    name : args[k].name,
                    inputType : 'hidden',
                    default : 0
                };
                args.push(inputClone);
            }

            // 'password' type input.
            if (v.name == 'password' || args[k].type == 'password') {
                // Change html input type
                args[k].inputType = 'password';
                args[k].isPassword = true;
            }

            if (args[k].type == "display_text") {
                args[k].isDisplayText = true;
                args[k].label = args[k].label.split("\n");
            }

        });
    }

    // Helper function that build app installation form
    app.helper('appInstallForm', function(appId, manifest, params) {
        var data = {
            id: appId,
            manifest: manifest
        };

        formatYunoHostStyleArguments(data.manifest.arguments.install, params);

        // Multilingual description
        data.description = (typeof data.manifest.description[y18n.locale] !== 'undefined') ?
                                data.manifest.description[y18n.locale] :
                                data.manifest.description['en']
                                ;

        // Multi Instance settings boolean to text
        data.manifest.multi_instance = data.manifest.multi_instance ? y18n.t('yes') : y18n.t('no');

        // View app install form
        c.view('app/app_install', data);
        return;
    });

    // App installation form
    app.get('#/apps/install/:app', function (c) {
        c.api('/apps?raw', function(data) { // http://api.yunohost.org/#!/app/app_list_get_8
            var app_name = c.params["app"];
            var app_infos = data[app_name];
            if (app_infos['state'] === "validated")
            {
                app_infos['state'] = "official";
            }
            var state_color = stateToColor(app_infos['state']);
            var level_color = levelToColor(parseInt(app_infos['level']));
            var is_safe_for_install_color = combineColors(state_color, level_color);

            if ((is_safe_for_install_color === "warning") || (is_safe_for_install_color === "danger"))
            {
                c.confirm(
                    y18n.t("applications"),
                    y18n.t("confirm_install_app_"+is_safe_for_install_color),
                    function(){
                        c.appInstallForm(
                            app_name,
                            app_infos.manifest,
                            c.params
                        );
                    },
                    function(){
                        $('div.loader').remove();
                        c.redirect('#/apps/install');
                    }
                );
            }
            else
            {
                c.appInstallForm(
                    c.params['app'],
                    data[c.params['app']].manifest,
                    c.params
                );
            }
        });
    });

    // Install app (POST)
    app.post('#/apps', function(c) {
        // Warn admin if app is going to be installed on domain root.
        if (c.params['path'] !== '/' || confirm(y18n.t('confirm_install_domain_root', [c.params['domain']]))) {
            var params = {
                label: c.params['label'],
                app: c.params['app']
            };

            // Check for duplicate arg produced by empty checkbox. (See inputClone)
            delete c.params['label'];
            delete c.params['app'];
            $.each(c.params, function(k, v) {
                if (typeof(v) === 'object' && Array.isArray(v)) {
                    // And return only first value
                    c.params[k] = v[0];
                }
            });

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

        var params = {
            label: c.params['label'],
            app: c.params['url']
        };
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
                var params = {
                    apps: c.params['app'],
                    users: []
                };
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
                var params = {
                    apps: c.params['app'],
                    users: c.params['user']
                };
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
                var params = {
                    apps: c.params['app'],
                    users: null
                };
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
        var params = {
            users: c.params['user'],
            apps: c.params['app']
        };
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
                var params = {
                    apps: c.params['app']
                };
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

    // Get app change label page
    app.get('#/apps/:app/changelabel', function (c) {
            c.api('/apps/'+c.params['app']+'?raw', function(app_data) {
              data = {
                id: c.params['app'],
                label: app_data.settings.label,
              };
              c.view('app/app_changelabel', data);
        });
    });

    // Change app label
    app.post('#/apps/:app/changelabel', function (c) {
        params = {'new_label': c.params['label']};
        c.api('/apps/' + c.params['app'] + '/label', function(data) { // Call changelabel API
            store.clear('slide');
            c.redirect('#/apps/'+ c.params['app']);
        }, 'PUT', params);
    });

    // Get app change URL page
    app.get('#/apps/:app/changeurl', function (c) {
            c.api('/apps/'+c.params['app']+'?raw', function(app_data) {
                c.api('/domains', function(domain_data) { // http://api.yunohost.org/#!/domain/domain_list_get_2

                // Display a list of available domains
                var domains = [];
                $.each(domain_data.domains, function(k, domain) {
                    domains.push({
                        value: domain,
                        label: domain,
                        // Select current domain
                        selected: (domain == app_data.settings.domain ? true : false)
                    });
                });

                data = {
                  id: c.params['app'],
                  label: app_data.manifest.name,
                  domains: domains,
                  // Pre-fill with current path
                  path: app_data.settings.path
                };
                c.view('app/app_changeurl', data);
            });
        });
    });

    // Change app URL
    app.post('#/apps/:app/changeurl', function (c) {
        c.confirm(
            y18n.t('applications'),
            y18n.t('confirm_app_change_url', [c.params['app']]),
            function() {
                params = {'domain': c.params['domain'], 'path': c.params['path']};
                c.api('/apps/' + c.params['app'] + '/changeurl', function(data) { // Call changeurl API
                    store.clear('slide');
                    c.redirect('#/apps/'+ c.params['app']);
                }, 'PUT', params);
            },
            function() {
                store.clear('slide');
                c.redirect('#/apps/'+ c.params['app'] + '/changeurl');
            }
        );
    });
})();
