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
            method = typeof method !== 'undefined' ? method : 'GET';
            data   = typeof data   !== 'undefined' ? data   : {};
            auth   = "Basic "+ btoa(store.get('user') +':'+ atob(store.get('password')));
            //this.swap('<img src="img/ajax-loader.gif" />');
            jQuery.ajax({
                url: store.get('url') + uri,
                type: method,
                crossdomain: true,
                data: data,
                dataType: 'json',
                beforeSend: function(req) {
                    req.setRequestHeader('Authorization', auth);
                }
            })
            .done(function(data) {
                console.log(data);
                result = data;
            })
            .fail(function() {
                req.redirect('#/login');
                result = false;
            })
            .always(function() {
                callback(result);
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

            blockSize = $('#slider').width();

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
            if (data.error) {
                c.flash('fail', 'Error: '+ data.error);
            } else {
                $('#disconnect-button').fadeIn();
                c.flash('success', 'Connected :)');
            }
            if (store.get('path')) {
                c.redirect(store.get('path'));
            } else {
                c.redirect('#/');
            }
        });
    });

    sam.get('#/users', function (c) {
        c.api('/users', function(data) {
            console.log(data);
            c.view('user_list', data);
        });
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
});


/**
 * Run the app
 *
 */
$(document).ready(function () {
    app.run('#/');
});
