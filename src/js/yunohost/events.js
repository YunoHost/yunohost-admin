(function() {
    // Get application context
    var app = Sammy.apps['#main'];
    var store = app.store;

    /**
     * Events
     *
     */
    app.bind('login', function(e, data) {
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
                    var link = $('link', v).text();
                    if (typeof link == 'string' && link !== '' && link.charAt(0) == '/') {
                        link = forumUrl+link;
                    }

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
                        viewedItems.push(item.guid);i
                    }
                });
                // Saved viewed items to cookie
                Cookies.set('ynhSecurityViewedItems', viewedItems, {
                    expires: 7
                });
            })
            .fail(function(stuff) {
                c.flash('fail', y18n.t('error_retrieve_feed', [securityFeed]));
            });

            c.api("/diagnosis", function(data) {
                versions = data.packages;
                $('#yunohost-version').html(y18n.t('footer_version', [versions.yunohost.version, versions.yunohost.repo]));
                if (data.security["CVE-2017-5754"].vulnerable) {
                    c.flash('danger', y18n.t('meltdown'));
                }
                $('div.loader').remove();
            });
        });
    });

    app.bind('logout', function(e, data) {
        $('#yunohost-version').empty();
    });


    // Konamicode ;P   up up down down left right left right b a
    var konami_code = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65],
    konami_step = 0;
    $(document).keydown(function (e) {
        if (e.keyCode === konami_code[konami_step++]) {
            if (konami_step === konami_code.length) {
                konami_step = 0;
                $('#main').addClass("with-nyancat");
                return false;
            }
        }
        else {
            konami_step = 0;
        }
    });

})();
