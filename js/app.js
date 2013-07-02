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
            $('#flash').html(html);
        },

        // API connection helper
        api: function (uri, callback, method, data) {
            method = typeof method !== 'undefined' ? method : 'GET';
            data   = typeof data   !== 'undefined' ? data   : {};
            auth   = "Basic "+ btoa(store.get('user') +':'+ atob(store.get('password')));
            this.swap('<img src="img/ajax-loader.gif" />');
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
                alert('fail');
                result = false;
            })
            .always(function() {
                callback(result);
            });
        },

        // Render view (cross-browser)
        view: function (view, data) {
            this.render('views/'+ view +'.ms', data).swap();
        }
    });


    /**
     * Filters
     *
     */
    sam.before({except: {path: '#/login'}}, function (req) {

        // Store path for further redirections
        store.set('path', req.path);

        // Redirect to login page if no credentials are stored
        if (!store.get('password')) {
            req.redirect('#/login');
            return false;
        }

        // Clear flash display
        if (!store.get('flash')) {
            $('#flash').html('');
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
        c.view('login');
    });

    sam.post('#/login', function (c) {
        store.set('url', c.params['url']);
        store.set('user', 'admin');
        store.set('password', btoa(c.params['password']));
        c.api('/users', function(data) {
            if (data.error) {
                c.flash('fail', 'Error: '+ data.error);
            } else {
                c.flash('success', 'Connected :)');
            }
            if (store.get('path')) {
                c.redirect(store.get('path'));
            } else {
                c.redirect('#/');
            }
        });
    });

    sam.get('#/users/:user', function (c) {
        c.swap('');
        c.api('/users/'+ c.params['user'], function(data) {
            c.view('user_info', data);
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
