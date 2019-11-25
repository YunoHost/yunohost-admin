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
        c.api('GET', '/apps?full', {}, function(data) {
            var apps = data['apps'];
            c.arraySortById(apps);
            c.view('app/app_list', {apps: apps});
        });
    });

    function levelToColor(level) {
        if (level >= 8) {
            return 'best';
        }
        else if (level > 4) {
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
        if (state === "high-quality") {
            return 'best';
        }
        else if (state === "working") {
            return 'success';
        }
        else {
            return 'danger';
        }
    }

    function maintainedStateToColor(state) {
        if ( state === "request_help" ) {
            return 'info';
        }
        else if ( state === "request_adoption" ) {
            return 'warning';
        }
        else if ( state === "orphaned" ) {
            return 'danger';
        }
        else {
            return 'success';
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

    function extractMaintainer(manifest) {
        if (manifest.maintainer === undefined)
        {
            if ((manifest.developer !== undefined) && (manifest.developer.name !== undefined))
            {
                return manifest.developer.name;
            }
            else
            {
                return "?";
            }
        }
        else if (Array.isArray(manifest.maintainer))
        {
            maintainers = [];
            manifest.maintainer.forEach(function(maintainer) {
                if (maintainer.name !== undefined)
                {
                    maintainers.push(maintainer.name);
                }
            });
            return maintainers.join(', ');
        }
        else if (manifest.maintainer.name !== undefined)
        {
            return manifest.maintainer.name;
        }
        else
        {
            return "?";
        }
    }

    // Display app catalog
    app.get('#/apps/catalog', function (c) {
        c.api('GET', '/appscatalog?full&with_categories', {}, function (data) {
            var apps = []
            $.each(data['apps'], function(name, app) {

                // Ignore not working apps
                if (app.state === 'notworking') { return; }

                app.id = app.manifest.id;
                app.level = parseInt(app.level);

                if (app.high_quality && app.level > 7)
                {
                    app.state = "high-quality";
                }
                if ( app.maintained === false )
                {
                    app.maintained = "orphaned";
                }
                else if ( app.maintained === true )
                {
                    app.maintained = "maintained";
                }

                app.manifest.maintainer = extractMaintainer(app.manifest);
                var isWorking = (app.state === 'working' || app.state === "high-quality") && app.level > 0;

                app.installable = (!app.installed || app.manifest.supports_multi_instance)
                app.levelFormatted = isNaN(app.level) ? '?' : app.level;

                app.levelColor = levelToColor(app.level);
                app.stateColor = stateToColor(app.state);
                app.maintainedColor = maintainedStateToColor(app.maintained);
                app.installColor = combineColors(app.stateColor, app.levelColor);

                app.updateDate = app.lastUpdate * 1000 || 0;
                app.isSafe = (app.installColor !== 'danger');
                app.isWorking = isWorking ? "isworking" : "notFullyWorking";
                app.isHighQuality = (app.state === "high-quality") ? "isHighQuality" : "";
                app.decentQuality = (app.level > 4)?"decentQuality":"badQuality";

                apps.push(app);
            });

            // Sort app list
            c.arraySortById(apps);

            // setup filtering of apps once the view is loaded
            function  setupFilterEvents () {
                // Uses plugin isotope to filter apps (we could had ordering to)
                var cardGrid = jQuery('#apps').isotope({
                  itemSelector: '.app-card',
                  layoutMode: 'fitRows',
                  transitionDuration: 200
                });

                var categoryGrid = jQuery('#app-categories').isotope({
                  itemSelector: '.app-category-card',
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

                // Default filter is 'decent quality apps'
                cardGrid.isotope({ filter: '.decentQuality' });

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
            c.view('app/app_catalog', {apps: apps, categories: data["categories"]}, setupFilterEvents);

        });
    });

    // Get app information
    app.get('#/apps/:app', function (c) {
        c.api('GET', '/apps/'+c.params['app']+'?full', {}, function(data) {
        c.api('GET', '/users/permissions', {}, function(data_permissions) {

            // Permissions
            data.permissions = data_permissions.permissions[c.params['app']+".main"]["allowed"];

            // Multilingual description
            data.description = (typeof data.manifest.description[y18n.locale] !== 'undefined') ?
                        data.manifest.description[y18n.locale] :
                        data.manifest.description['en']
                        ;

            // Multi Instance settings
            data.manifest.multi_instance = data.manifest.multi_instance ? y18n.t('yes') : y18n.t('no');
            data.install_time = new Date(data.settings.install_time * 1000);

            c.view('app/app_info', data, function() {

                // Button to set the app as default
                $('button[data-action="set-as-default"]').on("click", function() {
                    var app = $(this).data("app");
                    c.confirm(
                        y18n.t('applications'),
                        y18n.t('confirm_app_default'),
                        function() { c.api('PUT', '/apps/'+app+'/default', {}, function() { c.refresh() }); }
                    );
                });

                // Button to uninstall the app
                $('button[data-action="uninstall"]').on("click", function() {
                    var app = $(this).data("app");
                    c.confirm(
                        y18n.t('applications'),
                        y18n.t('confirm_uninstall', [app]),
                        function() {
                            c.api('DELETE', '/apps/'+ app, {}, function() {
                                c.redirect_to('#/apps');
                            });
                        }
                    );
                });
            });
        });
        });
    });

    //
    // App actions
    //

    // Get app actions list
    app.get('#/apps/:app/actions', function (c) {
        c.api('GET', '/apps/'+c.params['app']+'/actions', {}, function(data) {
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

    // Perform app action
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

        c.api('PUT', '/apps/'+app_id+'/actions/'+action_id, params, function() {
            c.redirect_to('#/apps/'+app_id+'/actions', {slide:false});
        });
    });

    //
    // App config panel
    //

    // Get app config panel
    app.get('#/apps/:app/config-panel', function (c) {
        c.api('GET', '/apps/'+c.params['app']+'/config-panel', {}, function(data) {
            $.each(data.config_panel.panel, function(_, panel) {
                $.each(panel.sections, function(_, section) {
                    formatYunoHostStyleArguments(section.options, c.params);
                });
            });
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

        c.api('POST', '/apps/'+app_id+'/config', params, function() {
            c.redirect_to('#/apps/'+app_id+'/config-panel', {slide:false});
        });
    })

    // Special case for custom app installation.
    app.get('#/apps/install/custom', function (c) {
        // If we try to GET /apps/install/custom, it means that installation fail.
        // Need to redirect to apps/install to get rid of pacamn and see the log.
        c.redirect_to('#/apps/install');
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
            args[k].required = (typeof v.optional !== 'undefined' && (v.optional == "true" || v.optional == true)) ? '' : 'required';
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
            manifest: manifest,
            displayLicense: (manifest['license'] !== undefined && manifest['license'] !== 'free')
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
        c.api('GET', '/appscatalog?full', {}, function(data) {
            var app_name = c.params["app"];
            var app_infos = data["apps"][app_name];
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
                    }
                );
            }
            else
            {
                c.appInstallForm(
                    c.params['app'],
                    app_infos.manifest,
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

            c.api('POST', '/apps', params, function() {
                c.redirect_to('#/apps');
            });
        }
        else {
            c.flash('warning', y18n.t('app_install_cancel'));
            c.refresh();
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
                    c.refresh();
                });
            }
        );
    });

    // Get app change label page
    app.get('#/apps/:app/changelabel', function (c) {
        c.api('GET', '/apps/'+c.params['app']+'?full', {}, function(app_data) {
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
        c.api('PUT', '/apps/' + c.params['app'] + '/label', params, function(data) {
            c.redirect_to('#/apps/'+ c.params['app']);
        });
    });

    // Get app change URL page
    app.get('#/apps/:app/changeurl', function (c) {
            c.api('GET', '/apps/'+c.params['app']+'?full', {}, function(app_data) {
                c.api('GET', '/domains', {}, function(domain_data) {

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
                c.api('PUT', '/apps/' + c.params['app'] + '/changeurl', params, function(data) {
                    c.redirect_to('#/apps/'+ c.params['app']);
                });
            }
        );
    });
})();
