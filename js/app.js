app = Sammy('#main', function (sam) {

    /**
     * Sammy Configuration
     *
     */
    // Plugins
    sam.use('Mustache', 'ms');

    // Initialize storage
    var store = new Sammy.Store({name: 'storage', type: 'session'});

    /**
     * Helpers
     *
     */
    sam.helpers({

        // Flash helper to diplay instant notifications
        flash: function (level, message) {
            flashs = store.get('flash');
            if (!flashs) { flashs = {'info': [], 'fail': [], 'success': [] } }
            flashs[level].push(message);
            store.set('flash', flashs);

            html = '';
            for(lvl in flashs) {
                flashs[lvl].forEach( function(msg) {
                    html += '<div class="'+ lvl +'">'+ msg +'</div>';
                });
            }
            if      (level == 'fail')    { alertClass = 'alert-danger'; }
            else if (level == 'success') { alertClass = 'alert-success'; }
            else                         { alertClass = 'alert-info'; }

            $('#flash').removeClass().addClass('alert '+ alertClass).html(html).fadeIn();
        },

        // API connection helper
        api: function (uri, callback, method, data) {
            c = this;
            method = typeof method !== 'undefined' ? method : 'GET';
            data   = typeof data   !== 'undefined' ? data   : {};
            auth   = "Basic "+ btoa(store.get('user') +':'+ atob(store.get('password')));
            jQuery.ajax({
                url: store.get('url') + uri,
                type: method,
                crossdomain: true,
                data: data,
                traditional: true,
                dataType: 'json',
                beforeSend: function(req) {
                    req.setRequestHeader('Authorization', auth);
                }
            })
            .success(function(data) {
                data = typeof data !== 'undefined' ? data : {};
                if (typeof data.win !== 'undefined') {
                    $.each(data.win, function(k, v) {
                        c.flash('success', v);
                    });
                }
                callback(data);
            })
            .fail(function(xhr) {
                console.log(xhr);
                if (xhr.status == 401) {
                    c.flash('fail', 'Wrong password');
                } else if (typeof xhr.responseJSON !== 'undefined') {
                    c.flash('fail', xhr.responseJSON.error);
                } else {
                    c.flash('fail', 'Server error');
                }
                store.clear('slide');
                c.redirect(store.get('path-1'));
            })
            .done(function(data) {
                console.log(data);
            });
        },

        // Render view (cross-browser)
        view: function (view, data) {
            rendered = this.render('views/'+ view +'.ms', data);

            function leSwap() {
                rendered.swap(function() {
                    $('.slide').on('click', function() {
                        $(this).addClass('active');
                        if ($(this).hasClass('back')) {
                            store.set('slide', 'back');
                        } else {
                            store.set('slide', 'to');
                        }
                    });
                });
            }

            blockSize = $('#slider').innerWidth();

            if (store.get('slide') == 'back') {
                if ($('#slideBack').is(':visible')) $('#slideBack').hide();
                $('#slider-container').removeClass('move').css('margin-left', '-'+ blockSize +'px');
                $('#slideTo').show().html($('#main').html());
                leSwap();
                $('#slider-container').addClass('move').css('margin-left', '0px');

                store.clear('slide');
            } else if (store.get('slide') == 'to') {
                if ($('#slideTo').is(':visible')) $('#slideTo').hide();
                $('#slider-container').removeClass('move').css('margin-left', '0px');
                $('#slideBack').show().html($('#main').html());
                leSwap();
                $('#slider-container').addClass('move').css('margin-left', '-'+ blockSize +'px');

                store.clear('slide');
            } else {
                leSwap();
            }
        }
    });


    /**
     * Filters
     *
     */
    sam.before({except: {path: '#/login'}}, function (req) {

        // Store path for further redirections
        store.set('path-1', store.get('path'));
        store.set('path', req.path);

        // Redirect to login page if no credentials stored
        if (!store.get('connected')) {
            req.redirect('#/login');
            return false;
        }

        // Clear flash display
        if (!store.get('flash')) {
            $('#flash').fadeOut(function() { $('#flash').html(''); });
        }
    });

    sam.after(function () {

        // Clear flash notifications
        store.clear('flash');
    });


    /**
     * Routes
     *
     * Note: var "c" is Sammy's route context
     * @doc http://sammyjs.org/docs/api/#Sammy.EventContext
     *
     */
    sam.get('#/', function (c) {
        c.view('home');
    });

    sam.get('#/login', function (c) {
        $('#logout-button').hide();
        store.set('path-1', '#/login');
        c.view('login');
    });

    sam.post('#/login', function (c) {
        store.set('url', 'http://'+ c.params['url']);
        store.set('user', 'admin');
        store.set('password', btoa(c.params['password']));
        c.api('/users', function(data) {
            store.set('connected', true);
            $('#logout-button').fadeIn();
            c.flash('success', 'Logged in');
            if (store.get('path')) {
                c.redirect(store.get('path'));
            } else {
                c.redirect('#/');
            }
        });
    });

    sam.get('#/logout', function (c) {
        store.clear('url');
        store.clear('user');
        store.clear('password');
        store.clear('connected');
        store.set('path', '#/');
        c.flash('success', 'Logged out');
        c.redirect('#/login');
    });

    /**
     * Users
     *
     */

    sam.get('#/users', function (c) {
        c.api('/users', function(data) { // http://api.yunohost.org/#!/user/user_list_get_3
            c.view('user_list', data);
        });
    });

    sam.get('#/users/create', function (c) {
        c.api('/domains', function(data) { // http://api.yunohost.org/#!/domain/domain_list_get_2
            c.view('user_create', data);
        });
    });

    sam.post('#/users', function (c) {
        if (c.params['password'] == c.params['confirmation']) {
            c.params['mail'] = c.params['email'] + c.params['domain'];
            c.api('/users', function(data) { // http://api.yunohost.org/#!/user/user_create_post_2
                c.redirect('#/users');
            }, 'POST', c.params.toHash());
        } else {
            c.flash('fail', "Passwords don't match");
            store.clear('slide');
            //c.redirect('#/users/create');
        }
    });

    sam.get('#/users/:user', function (c) {
        c.api('/users/'+ c.params['user'], function(data) { // http://api.yunohost.org/#!/user/user_info_get_0
            c.view('user_info', data);
        });
    });

    sam.get('#/users/:user/edit', function (c) {
        c.api('/users/'+ c.params['user'], function(data) { // http://api.yunohost.org/#!/user/user_info_get_0
            c.view('user_edit', data);
        });
    });

    sam.put('#/users/:user', function (c) {
        params = {}
        $.each(c.params.toHash(), function(key, value) {
            if (value !== '' && value !== 'user') { params[key] = value; }
        });
        if ($.isEmptyObject(params)) {
            c.flash('fail', 'You should modify something');
            store.clear('slide');
            c.redirect('#/users/'+ c.params['user'] + '/edit');
        } else {
            c.api('/users/'+ c.params['user'], function(data) { // http://api.yunohost.org/#!/user/user_update_put_1
                c.redirect('#/users/'+ c.params['user']);
            }, 'PUT', params);
        }
    });

    sam.get('#/users/:user/delete', function (c) {
        if (confirm('Are you sure you want to delete '+ c.params['user'] +' ?')) {
            c.api('/users/'+ c.params['user'], function(data) { // http://api.yunohost.org/#!/user/user_delete_delete_4
                c.redirect('#/users');
            }, 'DELETE');
        } else {
            store.clear('slide');
            c.redirect('#/users/'+ c.params['user']);
        }
    });

    /**
     * Domains
     *
     */

    sam.get('#/domains', function (c) {
        c.api('/domains', function(data) { // http://api.yunohost.org/#!/domain/domain_list_get_2
            c.view('domain_list', data);
        });
    });

    sam.get('#/domains/add', function (c) {
        c.view('domain_add', {'DDomains': ['.nohost.me', '.noho.st']});
    });

    sam.post('#/domains', function (c) {
        if (c.params['domain'] == '') {
            if (c.params['ddomain'] == '') {
                c.flash('fail', "You should indicate a domain");
                store.clear('slide');
                c.redirect('#/domains/add');
            }
            params = { 'domains': c.params['ddomain'] + c.params['ddomain-ext'] }
        } else {
            params = { 'domains': c.params['domain'] }
        }

        c.api('/domains', function(data) { // http://api.yunohost.org/#!/domain/domain_add_post_1
            c.redirect('#/domains');
        }, 'POST', params);
    });

    /**
     * Apps
     *
     */

    sam.get('#/apps', function (c) {
        c.api('/app/list', function(data) { // http://api.yunohost.org/#!/app/app_list_get_8
            // Keep only installed apps
            data2 = { 'Apps': [], 'Installed': true }
            $.each(data['Apps'], function(k, v) {
                if (v['Installed'] !== 'No') data2['Apps'].push(v);
            });
            c.view('app_list', data2);
        });
    });

    sam.get('#/apps/install', function (c) {
        c.api('/app/list', function(data) { // http://api.yunohost.org/#!/app/app_list_get_8
            // Keep only uninstalled apps
            data2 = { 'Apps': [] }
            $.each(data['Apps'], function(k, v) {
                if (v['Installed'] !== 'Yes') data2['Apps'].push(v);
            });
            c.view('app_list', data2);
        });
    });

    sam.get('#/apps/refresh', function (c) {
        c.api('/app/lists', function(data) { // http://api.yunohost.org/#!/app/app_fetchlist_put_5
            c.redirect(store.get('path'));
        }, 'PUT');
    });
});


/**
 * Run the app
 *
 */
$(document).ready(function () {
    app.run('#/');
    $('#slider-container').width(2*$('#slider').innerWidth() +'px');
    $(window).resize(function() {
        $('#slideBack').css('margin-left', '-'+ $('#slider').innerWidth() +'px');
        $('#slider-container').width(2*$('#slider').innerWidth() +'px');
    });
});
