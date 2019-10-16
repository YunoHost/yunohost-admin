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
            c.redirect_to('#/tools/adminpw', {slide: false});
        } else if (params['new_password'] !== params['confirm_new_password']) {
            c.flash('fail', y18n.t('passwords_dont_match'));
            c.redirect_to('#/tools/adminpw', {slide: false});
        } else {
            c.api('POST', '/login', { 'password': params['old_password'] }, function(data) {
                // Remove useless variable
                delete params['old_password'];
                delete params['confirm_new_password'];

                // Update password and redirect to the home
                c.api('PUT', '/adminpw', params, function(data) {
                    c.redirect_to('#/logout');
                });
            }, undefined, false);
        }
    });

    // System update & upgrade
    app.get('#/update', function (c) {
        c.api('PUT', '/update', {}, function(data) {
            c.view('update/update', data, function() {
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
                // Configure behavior for the button to share log on Yunohost (it calls display --share)
                $("#share-with-yunopaste").on("click", function() {
                    c.api('GET', '/logs/display?path='+$(this).data('log-id')+'&share', {},
                        function(data) {
                            $('div.loader').remove();
                            window.open(data.url, '_blank');
                    });
                });
            });
        });
    });


    // Download SSL Certificate Authority
    app.get('#/tools/ca', function (c) {
        c.view('tools/tools_ca');
    });

    // Security feed
    app.get('#/tools/security-feed', function (c) {
        var data = {
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
                var link = $('link', v)[0].innerHTML;
                if (typeof link == 'string' && link !== '' && link.charAt(0) == '/') {
                    link = forumUrl+link;
                }
                var description = $('description', v)[0].textContent;
                description = description.replace('href="/','href="'+forumUrl+'/');

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

    // Reboot or shutdown button
    app.get('#/tools/reboot', function (c) {
        c.view('tools/tools_reboot');
    });

    // Reboot or shutdown actions
    app.get('#/tools/reboot/:action', function (c) {
        var action = c.params['action'].toLowerCase();
        if (action == 'reboot' || action == 'shutdown') {
            c.confirm(
                y18n.t('tools_' + action),
                // confirm_reboot_action_reboot or confirm_reboot_action_shutdown
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

                        // Remove loader if any
                        $('div.loader').remove();

                        // Force scrollTop on page load
                        $('html, body').scrollTop(0);
                    }, false);
                }
            );
        }
        else {
            c.flash('fail', y18n.t('unknown_action', [action]));
            c.redirect_to('#/tools/reboot', {slide: false});
        }
    });

    // Diagnosis
    app.get('#/tools/diagnosis(/:private)?', function (c) {
        // See http://sammyjs.org/docs/routes for splat documentation
        var private = (c.params.splat[0] == 'private');

        var endurl = (private) ? '?private' : '';
        c.api('GET', '/diagnosis'+endurl, {}, function(diagnosis) {
            c.view('tools/tools_diagnosis', {
                'diagnosis' : JSON.stringify(diagnosis, undefined, 4),
                'raw' : diagnosis,
                'private' : private
            });
        });
    });

    // Reboot or shutdown button
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
            });
        });
        });
    });

    app.get('#/tools/migrations/run', function (c) {
        var disclaimerAcks = $(".disclaimer-ack");
        var withAcceptDisclaimerFlag = false;
        for (var i = 0 ; i < disclaimerAcks.length ; i++)
        {
            console.log($(disclaimerAcks[i]).find("input:checked").val());
            if (! $(disclaimerAcks[i]).find("input:checked").val())
            {
                // FIXME / TODO i18n
                c.flash('fail', "Some of these migrations require you to acknowledge a disclaimer before running them.");
                c.redirect_to('#/tools/migrations', {slide: false});
                return;
            }
            else
            {
                withAcceptDisclaimerFlag = true;
            }
        };

        // Not sure if necessary, but this distinction is to avoid accidentally
        // triggering a migration with a disclaimer if one goes to the
        // /tools/migrations/run page "directly" somehow ...
        if (withAcceptDisclaimerFlag)
        {
            c.api('POST', '/migrations/migrate?accept_disclaimer', {}, function (data) {
                c.redirect_to('#/tools/migrations', {slide: false});
            })
        }
        else
        {
            c.api('POST', '/migrations/migrate', {}, function (data) {
                c.redirect_to('#/tools/migrations', {slide: false});
            })
        }
    });

    app.get('#/tools/migrations/skip/:migration_id', function (c) {
        c.confirm(
            y18n.t('migrations'),
            y18n.t('confirm_migrations_skip'),
            function(){
                c.api('POST', '/migrations/migrate?skip&targets=' + c.params['migration_id'], {}, function(data) {
                    c.redirect_to('#/tools/migrations', {slide: false});
                });
            }
        );
    });

    // List available apps lists
    app.get('#/tools/appslists', function (c) {
        c.api('GET', '/appslists', {}, function(data) {
            list = [];
            $.each(data, function(listname, listinfo) {
                list.push({
                    'name': listname,
                    'url': listinfo['url'],
                    'lastUpdate': listinfo['lastUpdate']
                });
            });

            c.view('tools/tools_appslists_list', {
                appslists: list
            });
        });
    });

    // Add a new apps list
    app.post('#/tools/appslists', function (c) {
        list = {
            'name' : c.params['appslist_name'],
            'url' : c.params['appslist_url']
        }

        c.api('PUT', '/appslists', list, function(data) {
            c.redirect_to('#/tools/appslists/' + list.name);
        });
    });

    // Show appslist info and operations
    app.get('#/tools/appslists/:appslist', function (c) {
        c.api('GET', '/appslists', {}, function(data) {
            if (typeof data[c.params['appslist']] !== 'undefined') {
                list = {
                    'name' : c.params['appslist'],
                    'url': data[c.params['appslist']]['url'],
                    'lastUpdate': data[c.params['appslist']]['lastUpdate'],
                    'removable' : (c.params['appslist'] !== 'yunohost') ? true : false // Do not remove default apps list
                };
                c.view('tools/tools_appslists_info', {appslist: list});
            }
            else {
                c.flash('warning', y18n.t('appslists_unknown_list', [c.params['appslist']]));
                c.redirect_to('#/tools/appslists', {slide: false});
            }
        });
    });

    // Refresh available apps list
    app.get('#/tools/appslists/refresh', function (c) {
        c.api('PUT', '/appslists', {}, function(data) {
            c.redirect_to('#/apps/install', {slide: false});
        });
    });

    // Refresh specific apps list
    app.get('#/tools/appslists/:appslist/refresh', function (c) {
        c.api('PUT', '/appslists', {'name' : c.params['appslist']}, function(data) {
            c.redirect_to('#/tools/appslists', {slide: false});
        });
    });

    // Remove apps list
    app.get('#/tools/appslists/:appslist/remove', function (c) {
        c.confirm(
            y18n.t('appslist'),
            y18n.t('appslists_confirm_remove', [c.params['app']]),
            function() {
                c.api('DELETE', '/appslists', {'name' : c.params['appslist']}, function() {
                    c.redirect_to('#/tools/appslists');
                });
            }
        );
    });
})();
