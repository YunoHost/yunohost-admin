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
        var params = {};
        $.each(c.params.toHash(), function(key, value) {
            if (value !== '') { params[key] = value; }
        });
        if ($.isEmptyObject(params)) {
            c.flash('fail', y18n.t('error_modify_something'));
            c.refresh();
            return;
        }
        if (params['new_password'] !== params['confirm_new_password']) {
            c.flash('fail', y18n.t('passwords_dont_match'));
            c.refresh();
            return;
        }

        c.api('POST', '/login', { 'password': params['old_password'] }, function(data) {
            // Remove useless variable
            delete params['old_password'];
            delete params['confirm_new_password'];

            // Update password and redirect to the home
            c.api('PUT', '/adminpw', params, function(data) {
                c.redirect_to('#/logout');
            });
        }, undefined, false);
    });

    // System update & upgrade
    app.get('#/update', function (c) {
        c.api('PUT', '/update', {}, function(data) {
            c.view('tools/tools_update', data, function() {
                // Configure buttons behaviors
                $("button[data-upgrade]").on("click", function() {

                    var what = $(this).data("upgrade").toLowerCase();

                    // Upgrade all apps or the system

                    if ((what == "system") || (what == "system"))
                    {
                        var confirm_message = y18n.t('confirm_update_' + what);
                        var api_url = '/upgrade?'+what;
                    }

                    // Upgrade a specific apps

                    else
                    {
                        var confirm_message = y18n.t('confirm_update_specific_app', [what]);
                        var api_url = '/upgrade/apps?app='+what;
                    }

                    c.confirm(
                        y18n.t('tools'),
                        confirm_message,
                        function(){
                            c.api('PUT', api_url, {}, function(data) {
                                c.redirect_to('#/tools/logs');
                            });
                        }
                    );
                });
            });
        });
    });

    // Display journals list
    app.get('#/tools/logs', function (c) {
        c.api('GET', "/logs?limit=25&with_details", {}, function(categories) {
            data = [];
            category_icons = {
                'operation': 'wrench',
                'history': 'history',
                'package': 'puzzle-piece',
                'system': 'cogs',
                'access': 'ban',
                'service': 'cog',
                'app': 'cubes'
            }
            success_icons = {
                true: 'check text-success',
                false: 'close text-danger',
                '?': 'question text-warning'
            }
            for (var category in categories) {
                for (var log in categories[category])
                {
                    categories[category][log].success_icon = success_icons[categories[category][log].success]
                }
                if (categories.hasOwnProperty(category)) {
                    data.push({
                        key:category,
                        icon:(category in category_icons)?category_icons[category]:'info-circle',
                        value:categories[category]
                    });
                }
            }

            c.view('tools/tools_logs', {
                "data": data,
                "locale": y18n.locale
            });
        });
    });

    // One journal
    app.get(/\#\/tools\/logs\/(.*)(\?number=(\d+))?/, function (c) {
        var params = "?path=" + c.params["splat"][0];
        var number = (c.params["number"])?c.params["number"]:50;
        params += "&number=" + number;

        c.api('GET', "/logs/display" + params, {}, function(log) {
            if ('metadata' in log) {
                if (!'env' in log.metadata && 'args' in log.metadata) {
                    log.metadata.env = log.metadata.args
                }
            }

            c.view('tools/tools_log', {
                "log": log,
                "next_number": log.logs.length == number ? number * 10:false,
                "locale": y18n.locale
            }, function() {
                log = $("#main #log").html();
                log = log.replace(/.*: ERROR - .*/g, function (match) { return '<span class="alert-danger">'+match+'</span>'});
                log = log.replace(/.*: WARNING - .*/g, function (match) { return '<span class="alert-warning">'+match+'</span>'});
                log = log.replace(/.*: SUCCESS - .*/g, function (match) { return '<span class="alert-success">'+match+'</span>'});
                log = log.replace(/.*: INFO - .*/g, function (match) { return '<span class="alert-info">'+match+'</span>'});
                $("#main #log").html(log);

                // Configure behavior for the button to share log on Yunohost (it calls display --share)
                $('button[data-action="share"]').on("click", function() {
                    c.api('GET', '/logs/display?path='+$(this).data('log-id')+'&share', {},
                        function(data) {
                            c.hideLoader();
                            window.open(data.url, '_blank');
                    });
                });
            });
        });
    });

    // Reboot or shutdown button
    app.get('#/tools/reboot', function (c) {
        c.view('tools/tools_reboot', {}, function() {
            // Configure reboot/shutdown buttons behavior
            $("button[data-action]").on("click", function() {
                var action = $(this).data("action");

                c.confirm(
                    y18n.t('tools_' + action),
                    y18n.t('confirm_reboot_action_' + action),
                    function(){
                        c.api('PUT', '/'+action+'?force', {}, function(data) {
                            // This code is not executed due to 502 response (reboot or shutdown)
                            c.redirect_to('#/logout');
                        }, function (xhr) {
                            c.flash('success', y18n.t('tools_' + action + '_done'))
                            // Disconnect from the webadmin
                            store.clear('url');
                            store.clear('connected');
                            store.set('path', '#/');

                            // Rename the page to allow refresh without ask for rebooting
                            window.location.href = window.location.href.split('#')[0] + '#/';
                            // Display reboot or shutdown info
                            // We can't use template because now the webserver is off
                            if (action == 'reboot') {
                                $('#main').replaceWith('<div id="main"><div class="alert alert-warning"><i class="fa-refresh"></i> ' + y18n.t('tools_rebooting') + '</div></div>');
                            }
                            else {
                                $('#main').replaceWith('<div id="main"><div class="alert alert-warning"><i class="fa-power-off"></i> ' + y18n.t('tools_shuttingdown') + '</div></div>');
                            }

                            c.hideLoader();

                            // Force scrollTop on page load
                            $('html, body').scrollTop(0);
                    }, false);
                });
            });
        });
    });

    // Migrations
    app.get('#/tools/migrations', function (c) {
        c.api('GET', '/migrations?pending', {}, function(pending_migrations) {
        c.api('GET', '/migrations?done', {}, function(done_migrations) {
            pending_migrations = pending_migrations.migrations;
            done_migrations = done_migrations.migrations;

            // Get rid of _ in the raw name of migrations (cosmetic)
            for(var i = 0; i < pending_migrations.length; i++) {
                pending_migrations[i].name = pending_migrations[i].name.replace(/_/g, " ")
                if (pending_migrations[i].disclaimer)
                {
                    pending_migrations[i].disclaimer = pending_migrations[i].disclaimer.replace(/\n/g, "<br />");
                }
            }
            for(var i = 0; i < done_migrations.length; i++) {
                done_migrations[i].name = done_migrations[i].name.replace(/_/g, " ")
            }

            c.view('tools/tools_migrations', {
                'pending_migrations' : pending_migrations.reverse(),
                'done_migrations' : done_migrations.reverse()
            }, function() {

                // Configure button 'Run'
                $('button[data-action="run"]').on("click", function() {

                    var disclaimerAcks = $(".disclaimer-ack");
                    for (var i = 0 ; i < disclaimerAcks.length ; i++)
                    {
                        if (! $(disclaimerAcks[i]).find("input:checked").val())
                        {
                            // FIXME / TODO i18n
                            c.flash('fail', "Some of these migrations require you to acknowledge a disclaimer before running them.");
                            c.refresh();
                            return;
                        }
                    };

                    c.api('POST', '/migrations/migrate?accept_disclaimer', {}, function() { c.refresh(); });
                });

                // Configure buttons 'Skip'
                $('button[data-action="skip"]').on("click", function() {
                    var migration_id = $(this).data("migration");
                    c.confirm(
                        y18n.t('migrations'),
                        y18n.t('confirm_migrations_skip'),
                        function(){
                            c.api('POST', '/migrations/migrate?skip&targets=' + migration_id, {}, function() { c.refresh() });
                        }
                    );
                });
            });
        });
        });
    });
})();
