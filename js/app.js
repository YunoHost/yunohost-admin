app = Sammy('#main', function (sam) {

    sam.use('Mustache', 'ms');

    var store = new Sammy.Store({name: 'storage', type: 'session'});

    sam.helpers({
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
        api: function (uri, callback, method, data) {
            method = typeof method !== 'undefined' ? method : 'GET';
            data   = typeof data   !== 'undefined' ? data   : {};
            auth   = "Basic "+ btoa(store.get('user') +':'+ atob(store.get('password')));
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
        view: function (view, data) {
            //data = typeof data !== 'undefined' ? data : {};
            this.render('views/'+ view +'.ms', data).swap();
        }
    });

    sam.after(function () {
        store.set('flash', {'info': [], 'fail': [], 'success': [] });
    });

    sam.before({except: {path: '#/login'}}, function (req) {
        store.set('path', req.path);
        if (!store.get('user')) {
            req.redirect('#/login');
            return false;
        }
    });

    sam.get('#/', function (c) {
        c.view('home');
    });

    sam.get('#/users/:user', function (c) {
        c.swap('');
        c.api('/users/'+ c.params['user'], function(data) {
            c.view('user_info', data);
        });
    });

    sam.get('#/login', function (c) {
        c.view('login');
    });

    sam.post('#/login', function (c) {
        store.set('url', c.params['url']);
        store.set('user', c.params['user']);
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
});


$(document).ready(function () {
    app.run('#/');
});
