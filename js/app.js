app = Sammy('#main', function (sam) {

    /**
     * Sammy Configuration
     *
     */
    // Plugins
    sam.use('Handlebars', 'ms');

    Handlebars.registerHelper('humanSize', function(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return 'n/a';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[[i]];
    });
    Handlebars.registerHelper('humanTime', function(time) {
        return Math.round(time) + 's';
    });
    Handlebars.registerHelper('bitRate', function(bytes, time) {
        var sizes = ['b', 'Kb', 'Mb', 'Gb', 'Tb'];
        if (time == 0) return 'n/a';
        var bps = bytes / time * 8;
        var i = parseInt(Math.floor(Math.log(bps) / Math.log(1024)));
        return Math.round(bps / Math.pow(1024, i), 2) + ' ' + sizes[[i]] + '/s';
    });


    // Look for supported type of storage to use
    var storageType;
    if (Sammy.Store.isAvailable('session')) {
        storageType = 'session';
    } else if (Sammy.Store.isAvailable('cookie')) {
        storageType = 'cookie';
    } else {
        storageType = 'memory';
    }

    // Initialize storage
    var store = new Sammy.Store({name: 'storage', type: storageType});
    var loaded = false;

    /**
     * Helpers
     *
     */
    sam.helpers({

        // Serialize an object
        serialize : function(obj) {
          var str = [];
          for(var p in obj)
            if (obj.hasOwnProperty(p)) {
              str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
          return str.join("&");
        },

        // Flash helper to diplay instant notifications
        flash: function (level, message) {
            flashs = store.get('flash');
            if (!flashs) { flashs = {'info': [], 'fail': [], 'success': [] } }
            flashs[level].push(message);
            store.set('flash', flashs);

            html = '';
            for(lvl in flashs) {
                flashs[lvl].forEach( function(msg) {
                    if (lvl == 'fail') { alertClass = 'alert-danger'; }
                    else               { alertClass = 'alert-'+ lvl; }
                    html += '<div class="alert '+ alertClass +'">'+ msg +'</div>';
                });
            }
            $('#flash').html(html).fadeIn();
        },

        // API connection helper
        api: function (uri, callback, method, data) {
            c = this;
            method = typeof method !== 'undefined' ? method : 'GET';
            data   = typeof data   !== 'undefined' ? data   : {};
            var args = data;
            auth   = "Basic "+ btoa(store.get('user') +':'+ atob(store.get('password')));
            if (uri == '/postinstall') {
                var installing = false;

                setInterval(function () {
                    installing = true;
                }, 6000);

                $('#popup-title').text('Installing');
                $('#popup-body').html('<p>YunoHost is being installed on <strong>'+ data.domain +'</strong>. It may take a few minutes ...</p><br><div class="text-center"><img src="img/ajax-loader.gif"></div><br>');
                $('#popup').modal('show');
            } else {
                loaded = false;
                if ($('div.loader-content').length == 0) {
                setInterval(function () {
                    if (!loaded && $('div.loader-content').length == 0) {
                        $('#main').append('<div class="loader-content"><img src="img/ajax-loader.gif"></div>');
                    }
                }, 500);
                }
            }
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
                    if (uri == '/postinstall') {
                        if (installing) {
                            if (args.domain.match(/\.nohost\.me$/) || args.domain.match(/\.noho\.st$/)) {
                                $('#popup-title').text('Installed');
                                $('#popup-body p').text('YunoHost has been successfully installed, we\'ll wait for DNS to be propagated. It will take 3 minutes ...');
                                interval = 180000;
                            } else {
                                interval = 5000;
                            }
                            setInterval(function () {
                                $('#popup-title').text('Installation complete');
                                $('#popup-body').html('<p>YunoHost has been successfully installed, please go to <a href="https://'+ args.domain +'/ynhadmin" target="_blank"><strong>https://'+ args.domain +'/ynhadmin</strong></a>.</p><br><p><small><a href="https://doc.yunohost.org/#/dns" target="_blank">Not working ?</a></small></p>');
                            }, interval);
                        } else {
                            $('#popup').modal('hide');
                            c.flash('fail', 'An error occured, try again');
                        }
                    } else {
                        c.flash('fail', 'Server error');
                    }
                }
                store.clear('slide');
                c.redirect(store.get('path-1'));
            })
            .done(function(data) {
                loaded = true;
                $('div.loader-content').remove();
                console.log(data);
            });
        },

        // Render view (cross-browser)
        view: function (view, data) {
            rendered = this.render('views/'+ view +'.ms', data);

            enableSlide = true; // Change to false to disable animation

            loaded = true;
            $('div.loader-content').remove();

            if (enableSlide) {
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

                blockSize = $('#slider').width();

                // Slide back effect
                if (store.get('slide') == 'back') {
                    store.clear('slide');
                    $('#slideBack').css('display', 'none');
                    $('#slider-container').removeClass('move').css('margin-left', '-'+ blockSize +'px');
                    $('#slideTo').show().html($('#main').html());
                    leSwap();
                    $('#slider-container').addClass('move').css('margin-left', '0px');

                // Slide to effect
                } else if (store.get('slide') == 'to') {
                    store.clear('slide');
                    $('#slideTo').css('display', 'none');
                    $('#slider-container').removeClass('move').css('margin-left', '-'+ blockSize +'px');
                    $('#slider-container').removeClass('move').css('margin-left', '0px');
                    $('#slideBack').show().html($('#main').html());
                    leSwap();
                    $('#slider-container').addClass('move').css('margin-left', '-'+ blockSize +'px');

                } else {
                    leSwap();
                }
            } else {
                rendered.swap();
            }
        }
    });


    /**
     * Filters
     *
     */
    sam.before({except: {path: ['#/login', '#/postinstall']}}, function (req) {

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

        // Show development note
        c.flash('info', '<b>You are using a development version.</b><br />' +
            'Please note that you can use the <a href="https://doc.yunohost.org/#/moulinette" target="_blank">moulinette</a>  if you want to access to more YunoHost\'s features.');

        // Available sections
        data = {links: [
            {name: "Users", path: '#/users'},
            {name: "Domains", path: '#/domains'},
            {name: "Applications", path: '#/apps'},
            {name: "Services", path: '#/services'},
            {name: "Monitoring", path: '#/monitor'},
        ]};

        c.view('home', data);
    });

    sam.get('#/login', function (c) {
        $('.logout-button').hide();
        store.set('path-1', '#/login');

        // Check if te client is hosted on a yunohost node
        domain = window.location.hostname
        $.ajax({
            url: 'https://'+ domain +'/ynhapi/api',
            timeout: 3000
        })
        .success(function() {
            $.getJSON('https://'+ domain +'/ynhapi/installed', function(data) {
                if (!data.installed) {
                    c.redirect('#/postinstall');
                } else {
                    c.view('login', { 'domain': domain });
                }
            });
        })
        .fail(function() {
            c.view('login');
        });
    });

    sam.post('#/login', function (c) {
        store.set('url', 'https://'+ c.params['domain'] +'/ynhapi');
        store.set('user', 'admin');
        store.set('password', btoa(c.params['password']));
        c.api('/api', function(data) {
            if (data.apiVersion) {
                c.api('/users', function(data) {
                    store.set('connected', true);
                    $('.logout-button').fadeIn();
                    c.flash('success', 'Logged in');
                    if (store.get('path')) {
                        c.redirect(store.get('path'));
                    } else {
                        c.redirect('#/');
                    }
                });
            } else {
                c.flash('fail', 'Non-compatible API');
                c.redirect('#/login');
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

    sam.get('#/postinstall', function(c) {
        c.view('postinstall', {'DDomains': ['.nohost.me', '.noho.st']});
    });

    sam.post('#/postinstall', function (c) {
        if (c.params['password'] == c.params['confirmation']) {
            if (c.params['domain'] == '') {
                if (c.params['ddomain'] == '') {
                    c.flash('fail', "You should indicate a domain");
                    store.clear('slide');
                    c.redirect('#/postinstall');
                } else {
                    params = { 'domain': c.params['ddomain'] + c.params['ddomain-ext'] }
                }
            } else {
                params = { 'domain': c.params['domain'] }
            }

            params['password'] = c.params['password']

            store.set('url', 'https://'+ window.location.hostname +'/ynhapi');
            store.set('user', 'admin');
            store.set('password', btoa('yunohost'));
            c.api('/postinstall', function(data) { // http://api.yunohost.org/#!/tools/tools_postinstall_post_0
                c.redirect('#/');
            }, 'POST', params);
        } else {
            c.flash('fail', "Passwords don't match");
        }
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
        c.api('/apps', function(data) { // http://api.yunohost.org/#!/app/app_list_get_8
            // Keep only installed apps
            data2 = { 'Apps': [], 'Installed': true }
            $.each(data['Apps'], function(k, v) {
                if (v['Installed']) data2['Apps'].push(v);
            });
            c.view('app_list', data2);
        });
    });

    sam.get('#/apps/install', function (c) {
        c.api('/apps', function(data) { // http://api.yunohost.org/#!/app/app_list_get_8
        c.api('/apps?raw=true', function(dataraw) { // http://api.yunohost.org/#!/app/app_list_get_8
            // Keep only uninstalled apps
            data2 = { 'Apps': [] }
            $.each(data['Apps'], function(k, v) {
                if (dataraw[v['ID']].manifest.multi_instance) v['Installed'] = false;
                if (!v['Installed'] && !v['ID'].match(/__[0-9]{1,5}$/)) data2['Apps'].push(v);
            });
            c.view('app_list', data2);
        });
        });
    });

    sam.get('#/apps/refresh', function (c) {
        c.api('/app/lists', function(data) { // http://api.yunohost.org/#!/app/app_fetchlist_put_5
            c.redirect(store.get('path'));
        }, 'PUT');
    });

    sam.get('#/apps/:app', function (c) {
        c.api('/app/'+c.params['app']+'?raw=true', function(data) { // http://api.yunohost.org/#!/app/app_info_get_9
            c.view('app_info', data);
        });
    });

    sam.get('#/apps/install/:app', function (c) {
        c.api('/apps?raw=true', function(data) { // http://api.yunohost.org/#!/app/app_list_get_8
            c.view('app_install', data[c.params['app']]);
        });
    });

    sam.post('#/apps', function(c) {
        params = { 'label': c.params['label'], 'app': c.params['app'] }
        delete c.params['label'];
        delete c.params['app'];
        params['args'] = c.serialize(c.params.toHash());
        c.api('/app', function() { // http://api.yunohost.org/#!/app/app_install_post_2
            c.redirect('#/apps');
        }, 'POST', params);
    });

    sam.get('#/apps/:app/uninstall', function (c) {
        if (confirm('Are you sure you want to uninstall '+ c.params['app'] +' ?')) {
            c.api('/app/'+ c.params['app'], function() { // http://api.yunohost.org/#!/app/app_remove_delete_4
                c.redirect('#/apps');
            }, 'DELETE');
        } else {
            store.clear('slide');
            c.redirect('#/apps/'+ c.params['app']);
        }
    });

    /**
     * Services
     *
     */

    // All services status
    sam.get('#/services', function (c) {
        c.api('/service/status', function(data) { // ?
            data2 = { 'services': [] }
            $.each(data, function(k, v) {
                v.name = k;
                v.is_loaded = (v.loaded=='enabled') ? true : false;
                v.is_running = (v.status=='running') ? true : false;
                data2.services.push(v);
            });
            c.view('service_list', data2);
        });
    });

    // Status & actions for a service
    sam.get('#/services/:service', function (c) {
        params = { 'names': c.params['service'] }
        c.api('/service/status', function(data) { // ?
            data2 = { 'service': data }
            data2.service.name = c.params['service'];
            data2.service.is_loaded = (data.loaded=='enabled') ? true : false;
            data2.service.is_running = (data.status=='running') ? true : false;

            store.clear('slide');
            c.view('service_info', data2);
        }, 'GET', params);
    });

    // Service log
    sam.get('#/services/:service/log', function (c) {
        params = { 'name': c.params['service'], 'number': 50 }
        c.api('/service/log', function(data) { // ?
            data2 = { 'logs': [], 'name': c.params['service'] }
            $.each(data, function(k, v) {
                data2.logs.push({filename: k, filecontent: v.join('\n')});
            });

            store.clear('slide');
            c.view('service_log', data2);
        }, 'GET', params);
    });

    // Enable/Disable & Start/Stop service
    sam.get('#/services/:service/:action', function (c) {
        if (confirm('Are you sure you want to '+ c.params['action'] +' '+ c.params['service'] +' ?')) {
            params = { 'names': c.params['service'] }
            c.api('/service/'+ c.params['action'], function(data) {
                store.clear('slide');
                c.redirect('#/services/'+ c.params['service']);
            }, 'GET',  params);
        } else {
            store.clear('slide');
            c.redirect('#/services/'+ c.params['service']);
        }
    });


    /**
     * Monitor
     *
     */

    // 
    sam.get('#/monitor', function (c) {
        monitorData = {}

        // Why this method ? 
        c.api('/service/status', function(data) { // ?
            monitorData.status = true;

            if (data.status == 'running') {
                c.api('/monitor/system', function(data) {
                    monitorData.system = data;

                    c.api('/monitor/disk', function(data) {
                        monitorData.disk = data;

                        c.api('/monitor/network', function(data) {
                            monitorData.network = data;

                            // Remove useless interface
                            delete monitorData.network.usage.lo;

                            c.view('monitor', monitorData);
                        });

                    });
                });
            }
            else {
                monitorData.status = false;
                c.view('monitor', monitorData);
            }



        }, 'GET', {names: 'glances'});
    });



});


/**
 * Run the app
 *
 */
$(document).ready(function () {
    app.run('#/');

    // Fixes for sliding effect
    $('#slider-container').width(2*$('#slider').width() +'px');
    $(window).resize(function() {
        $('#slideBack').css('display', 'none');
        $('#slideTo').css('display', 'none');
        $('#slider-container').width(2*$('#slider').width() +'px').removeClass('move').css('margin-left', '0px');
    });
});
