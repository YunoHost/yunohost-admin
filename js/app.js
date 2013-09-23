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
                c.flash('fail', xhr.responseJSON.error);
                c.redirect(store.get('path-1'));
                store.clear('slide');
            })
            .done(function(data) {
                console.log(data);
            });
        },

        // Render view (cross-browser)
        view: function (view, data) {
            rendered = this.render('views/'+ view +'.ms', data);

            function leSwap() {
                $('#slideBack').hide().html('');
                $('#slideTo').hide().html('');
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
                $('#slideBack').css('display', 'inline-block').css('margin-left', '-'+ 2*blockSize +'px');
                rendered.appendTo($('#slideBack'));
                $('#main').animate({marginLeft: blockSize +'px'}, 500, function() {
                    $('#main').html($('#slideBack').html());
                    $('#main').css('margin-left', '0');
                    leSwap();
                });
                store.clear('slide');
            } else if (store.get('slide') == 'to') {
                $('#slideTo').css('display', 'inline-block');
                rendered.appendTo($('#slideTo'));
				$('#main').animate({marginLeft: '-'+ blockSize +'px'}, 500, function() {
                    $('#main').html($('#slideTo').html());
                    $('#main').css('margin-left', '0');
                    leSwap();
                });
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
        if (!store.get('password')) {
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
        $('#disconnect-button').hide();
        c.view('login');
    });

    sam.post('#/login', function (c) {
        store.set('url', 'http://'+ c.params['url']);
        store.set('user', 'admin');
        store.set('password', btoa(c.params['password']));
        c.api('/users', function(data) {
            $('#disconnect-button').fadeIn();
            if (store.get('path')) {
                c.redirect(store.get('path'));
            } else {
                c.redirect('#/');
            }
        });
    });

    sam.get('#/users', function (c) {
        c.api('/users', function(data) {
            c.view('user_list', data);
        });
    });

    sam.get('#/users/create', function (c) {
        c.api('/domains', function(data) {
            c.view('user_create', data);
        });
    });

    sam.post('#/users', function (c) {
        if (c.params['password'] == c.params['confirmation']) {
            c.params['mail'] = c.params['email'] + '@' + c.params['domain'];
            c.api('/users', function(data) {
                c.redirect('#/users');
            }, 'POST', c.params.toHash());
        } else {
            c.flash('fail', "Passwords don't match");
            store.clear('slide');
            //c.redirect('#/users/create');
        }
    });

    sam.get('#/users/:user', function (c) {
        c.api('/users/'+ c.params['user'], function(data) {
            c.view('user_info', data);
        });
    });

    sam.get('#/users/:user/edit', function (c) {
        c.api('/users/'+ c.params['user'], function(data) {
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
            c.api('/users/'+ c.params['user'], function(data) {
                c.redirect('#/users/'+ c.params['user']);
            }, 'PUT', params);
        }
    });

    sam.get('#/users/:user/delete', function (c) {
        if (confirm('Are you sure you want to delete '+ c.params['user'] +' ?')) {
            c.api('/users/'+ c.params['user'], function(data) {
                c.redirect('#/users');
            }, 'DELETE');
        } else {
            store.clear('slide');
            c.redirect('#/users/'+ c.params['user']);
        }
    });
});


/**
 * Run the app
 *
 */
$(document).ready(function () {
    app.run('#/');
});
