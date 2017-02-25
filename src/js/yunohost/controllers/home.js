(function() {
    // Get application context
    var app = Sammy.apps['#main'];
    var store = app.store;

    /**
     * Home
     *
     */

     // Home page
    app.get('#/', function (c) {
        c.api('/users', function(data) {
            // Warn admin if no users are created.
            if (typeof data.users !== 'undefined' && data.users.length === 0) {
                c.flash('warning', y18n.t('warning_first_user'));
            }

            // Get security feed and display new items
            var securityFeed = 'https://yunohost.org/security.rss';
            var forumUrl = 'https://forum.yunohost.org';

            $.ajax({
                url: securityFeed,
                // dataType: (jQuery.browser.msie) ? "text" : "xml",
                dataType: "xml"
            })
            .done(function(xml){
                // Get viewed security alerts from cookie
                var viewedItems = Cookies.get('ynhSecurityViewedItems') || [];

                // Get 6 month earlier date
                var SixMonthEarlier = new Date();
                SixMonthEarlier.setMonth(SixMonthEarlier.getMonth() - 6);

                // Loop through items in a reverse order (older first)
                $($('item', xml).get().reverse()).each(function(k, v) {
                    var link=$('link', v).text();
                    if (typeof link == 'string' && link !== '' && link.charAt(0) == '/')
                        link=forumUrl+link;

                    // var description=$('description', v).text();
                    // description=description.replace('href="/','href="'+forumUrl+'/');

                    var item = {
                        guid: $('guid', v).text(),
                        title: $('title', v).text(),
                        url: link,
                        // desc: description,
                        date: new Date($('pubDate', v).text()),
                    };

                    // If item is not already viewed and is not older than 6 month
                    if (viewedItems.indexOf(item.guid) === -1 && (item.date.getTime() > SixMonthEarlier.getTime())) {
                        // Show security message to administrator
                        var warning = item.title + ' - ' + 
                                                item.date.toISOString().substring(0, 10) + 
                                                ' (<a href="'+ item.url +'" class="alert-link" target="_blank">'+y18n.t('read_more')+'</a>)';
                        c.flash('warning', warning);
                        // Store viewed item
                        viewedItems.push(item.guid);
                    }
                });
                // Saved viewed items to cookie
                Cookies.set('ynhSecurityViewedItems', viewedItems, {
                    expires: 7
                });
            })
            .fail(function() {
                c.flash('fail', y18n.t('error_retrieve_feed', [securityFeed]));
            });

            c.view('home');
        });
    });



    /**
     * Login
     *
     */

    app.get('#/login', function (c) {
        $('#masthead').show()
            .find('.logout-btn').hide();
        store.set('path-1', '#/login');
        if ($('div.loader').length === 0) {
            $('#main').append('<div class="loader loader-content"></div>');
        }

        c.checkInstall(function(isInstalled) {
            if (isInstalled) {
                // Remove loader
                $('div.loader').remove();
                // Pass domain to hide form field
                c.view('login', { 'domain': window.location.hostname });
            } else if (typeof isInstalled === 'undefined') {
                if (app.isInstalledTry > 0) {
                    app.isInstalledTry--;
                    app.loaded = false; // Show pacman
                    setTimeout(function() {
                        c.redirect('#/');
                    }, 5000);
                }
                else {
                    // Reset count
                    app.isInstalledTry = 3;

                    // API is not responding after 3 try
                    $( document ).ajaxError(function( event, request, settings ) {
                        // Display error if status != 200.
                        // .ajaxError fire even with status code 200 because json is sometimes not valid.
                        if (request.status !== 200) c.flash('fail', y18n.t('api_not_responding', [request.status+' '+request.statusText] ));

                        // Unbind directly
                        $(document).off('ajaxError');
                    });

                    // Remove pacman
                    app.loaded = true;
                    $('div.loader').remove();
                }
            } else {
                $('div.loader').remove();
                c.redirect('#/postinstall');
            }
        });
    });


    /**
     * Logout
     *
     */

    app.post('#/login', function (c) {
        // Store url from params, it could have change form 'run' state
        store.set('url', c.params['domain'] +'/yunohost/api');

        params = {
            'password': c.params['password']
        };
        c.api('/login', function(data) {
            store.set('connected', true);
            c.trigger('login');
            $('#masthead .logout-btn').fadeIn();
            c.flash('success', y18n.t('logged_in'));
            if (store.get('path')) {
                c.redirect(store.get('path'));
            } else {
                c.redirect('#/');
            }
        }, 'POST', params, false);

    });

    app.get('#/logout', function (c) {
        c.api('/logout', function (data) {
            store.clear('url');
            store.clear('connected');
            store.set('path', '#/');
            c.trigger('logout');
            c.flash('success', y18n.t('logged_out'));
            c.redirect('#/login');
        }, 'GET', {}, false);
    });

})();
