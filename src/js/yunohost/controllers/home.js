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
            if (data.users.length === 0) {
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
                    if (viewedItems.indexOf(item.guid) === -1) {
                        // Show security message to administrator
                        // var warning = '<h2>'+ item.title +'</h2>'+ item.desc
                        var warning = item.title + ' (<a href="'+ item.url +'" class="alert-link" target="_blank">'+y18n.t('read_more')+'</a>)';
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
                domain = window.location.hostname;
                $('div.loader').remove();
                c.view('login', { 'domain': domain });
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
        store.set('url', c.params['domain'] +'/yunohost/api');

        params = {
            'password': c.params['password']
        };
        c.api('/login', function(data) {
            store.set('connected', true);

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
            c.flash('success', y18n.t('logged_out'));
            c.redirect('#/login');
        }, 'GET', {}, false);
    });

})();
