var app = Sammy('#main', function (sam) {


    /**
     * Application bootstrap
     *
     */
    sam.bind('run', function () {

        // Fixes for sliding effect
        $('#slider-container').width(2*$('#slider').width() +'px');
        $(window).resize(function() {
            $('#slideBack').css('display', 'none');
            $('#slideTo').css('display', 'none');
            $('#slider-container').width(2*$('#slider').width() +'px').removeClass('move').css('margin-left', '0px');
        });

        // Flash messages
        var flashMessage = $('#flashMessage');
        $('#toggle-btn', flashMessage).click(function(e) {
            flashMessage.toggleClass('open');
        });
        $('#clear-btn', flashMessage).click(function(e) {
            flashMessage.removeClass('open').find('.messages').html('');
            $('#slider').removeClass('with-flashMessage');
        });

    });


    /**
     * Sammy Configuration
     *
     */
    // Plugins
    sam.use('Handlebars', 'ms');

    Handlebars.registerHelper('ucwords', function(str) {
        return (str + '').replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function ($1) {
            return $1.toUpperCase();
        });
    });
    Handlebars.registerHelper('humanSize', function(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return 'n/a';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[[i]];
    });
    Handlebars.registerHelper('humanTime', function(time) {
        return Math.round(time) + 's';
    });
    Handlebars.registerHelper('bitRate', function(bytes, time) {
        var sizes = ['b', 'Kb', 'Mb', 'Gb', 'Tb'];
        if (time === 0) return 'n/a';
        var bps = bytes / time * 8;
        var i = parseInt(Math.floor(Math.log(bps) / Math.log(1024)));
        return Math.round(bps / Math.pow(1024, i), 2) + ' ' + sizes[[i]] + '/s';
    });

    Handlebars.registerHelper('t', function(y18n_key) {
      var result = y18n.t(y18n_key, Array.prototype.slice.call(arguments, 1));
      return new Handlebars.SafeString(result);
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
    var isInstalledTry = 3;

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
            if (!store.get('flash')) {
                store.set('flash', true);
            }

            // Helper CSS class on main wrapper
            $('#slider').addClass('with-flashMessage');

            // If the line is a bash command
            if (level === 'info' && message.charAt(0) === '+') {
                level = 'log';
            }

            $('#flashMessage .messages')
                .prepend('<div class="alert alert-'+ level +'">'+
                              '<p>'+ message +'</p></div>');
        },

        checkInstall: function(callback) {
            domain = window.location.hostname;
            $.ajax({
                dataType: "json",
                url: 'https://'+ domain +'/yunohost/api/installed',
                timeout: 3000
            })
            .success(function(data) {
                callback(data.installed);
            })
            .fail(function() {
                callback(undefined);
            });
        },

        // API call
        api: function(uri, callback, method, data, websocket) {
            c = this;

            call = function(uri, callback, method, data) {
                method = typeof method !== 'undefined' ? method : 'GET';
                data   = typeof data   !== 'undefined' ? data   : {};
                if (window.navigator && window.navigator.language && (typeof data.locale === 'undefined')) {
                    data.locale = y18n.locale || window.navigator.language.substr(0, 2);
                }

                var args = data;
                if (uri === '/postinstall') {
                    var installing = false;
                    setInterval(function () {
                        installing = true;
                    }, 1500);
                }

                loaded = false;
                if ($('div.loader').length === 0) {
                    setInterval(function () {
                        if (!loaded && $('div.loader').length === 0) {
                            $('#main').append('<div class="loader loader-content"></div>');
                        }
                    }, 500);
                }

                jQuery.ajax({
                    url: 'https://'+ store.get('url') + uri,
                    type: method,
                    crossdomain: true,
                    data: data,
                    traditional: true,
                    dataType: 'json'
                })
                .always(function(xhr, ts, error) {
                })
                .done(function(data) {
                    data = data || {};
                    callback(data);
                })
                .fail(function(xhr) {
                    if (xhr.status == 200) {
                        // Fail with 200, WTF
                        callback({});
                    } else if (xhr.status == 401) {
                        if (uri === '/login') {
                            c.flash('fail', y18n.t('wrong_password'));
                        } else {
                            c.flash('fail', y18n.t('unauthorized'));
                            c.redirect('#/login');
                        }
                    } else if (typeof xhr.responseJSON !== 'undefined') {
                        c.flash('fail', xhr.responseJSON.error);
                    } else if (typeof xhr.statusText !== 'undefined' && uri !== '/postinstall') {
                        c.flash('fail', y18n.t('api_not_responding', [xhr.status+' '+xhr.statusText]));
                    } else {
                        if (uri === '/postinstall') {
                            if (installing) {
                                interval = window.location.hostname === args.domain ? 20000 : 5000;
                                checkInstall = setInterval(function () {
                                    c.checkInstall(function(isInstalled) {
                                        if (isInstalled || typeof isInstalled === 'undefined') {
                                            c.flash('success', y18n.t('installation_complete'));
                                            clearInterval(checkInstall);
                                            window.location.href = 'https://'+ window.location.hostname +'/yunohost/admin/';
                                        }
                                    });
                                }, interval);
                            } else {
                                c.flash('fail', y18n.t('error_occured'));
                            }
                        } else {
                            c.flash('fail', y18n.t('error_server'));
                        }
                    }
                    if (uri !== '/postinstall') {
                        store.clear('slide');
                        c.view(store.get('path-1'), null, null, false);
                    }
                });
            };

            websocket = typeof websocket !== 'undefined' ? websocket : true;
            if (websocket) {

                // Open a WebSocket connection to retrieve live messages from the moulinette
                ws = new WebSocket('wss://'+ store.get('url') +'/messages');
                ws.onmessage = function(evt) {
                    // console.log(evt.data);
                    $.each($.parseJSON(evt.data), function(k, v) {
                        c.flash(k, v);
                    });
                };

                // If not connected, WebSocket connection will raise an error, but we do not want to interrupt API request
                ws.onerror = ws.onopen;

                ws.onclose = function() {};

                ws.onopen = call(uri, callback, method, data);
            } else {
                call(uri, callback, method, data);
            }

        },

        // Render view (cross-browser)
        view: function (view, data, callback, enableSlide) {
            callback = typeof callback !== 'undefined' ? callback : function() {};
            rendered = this.render('views/'+ view +'.ms', data);

            enableSlide = (typeof enableSlide !== 'undefined') ? enableSlide : true; // Change to false to disable animation

            loaded = true;
            $('div.loader').remove();
            $('#modal').modal('hide');

            if (enableSlide) {
                var leSwap = function() {
                    rendered.swap(function() {
                        $('.slide, .btn-breadcrumb a:not(:last-child)').on('click', function() {
                            $(this).addClass('active');
                            if ($(this).hasClass('back') || $(this).parent('.btn-breadcrumb').length) {
                                store.set('slide', 'back');
                            } else {
                                store.set('slide', 'to');
                            }
                        });
                        callback();
                        // Force scrollTop on page load
                        $('html, body').scrollTop(0);

                        // Resize body after the animation finishes (0.2s css transition)
                        // https://github.com/YunoHost/yunohost-admin/blob/231aac076a3aa836409b0d33fe02e48975990b7a/src/css/style.less#L92
                        setTimeout(function() {
                            $('body').resize();
                        }, 210);
                    });
                };

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
                rendered.swap(function(){
                    callback();
                    // Force scrollTop on page load
                    $('html, body').scrollTop(0);
                    $('body').resize();
                });
            }
        },

        confirm: function(title, content, confirmCallback, cancelCallback) {
            // Default callbacks
            confirmCallback = typeof confirmCallback !== 'undefined' ? confirmCallback : function() {};
            cancelCallback = typeof cancelCallback !== 'undefined' ? cancelCallback : function() {};

            // Get modal element
            box = $('#modal');

            // Modal title
            if (typeof title === 'string' && title.length) {
                $('.title', box).html(title);
            }
            else {
                box.addClass('no-title');
            }

            // Modal content
            $('.content', box).html(content);

            // Handle buttons
            $('footer button', box)
                .click(function(e){
                    e.preventDefault();

                    $('#modal footer button').unbind( "click" );
                    // Reset & Hide modal
                    box
                        .removeClass('no-title')
                        .modal('hide');

                    // Do corresponding callback
                    if ($(this).data('action') == 'confirm') {
                        confirmCallback();
                    }
                    else {
                        cancelCallback();
                    }
                });

            // Show modal
            return box.modal('show');
        },

        arraySortById: function(arr) {
            arr.sort(function(a, b){
                if (a.id > b.id) {
                    return 1;
                }
                else if (a.id < b.id) {
                    return -1;
                }
                return 0;
            });
        },

        arrayDiff: function(arr1, arr2) {
            arr1 = arr1 || [];
            arr2 = arr2 || [];
            return arr1.filter(function (a) {
                return ((arr2.indexOf(a) == -1) && (a !== ""));
            });
        },
        
        groupHooks: function(hooks) {
            data={}; 
            var rules=[
                {
                    id:'configuration',
                    isIn:function (hook) { 
                        return hook.indexOf('conf_')==0
                    }
                }
            ];
            
            $.each(hooks, function(i, hook) {
                var group_id=hook;
                $.each(rules, function(i, rule) {
                    if (rule.isIn(hook))
                    {
                        group_id='adminjs_group_'+rule.id;
                        return false;
                    }
                });
                if(group_id in data) 
                    data[group_id]={
                        name:y18n.t('hook_'+group_id),
                        value:data[group_id].value+','+hook,
                        description:data[group_id].description+', '+y18n.t('hook_'+hook)
                    };
                else
                    data[group_id]={
                        name:y18n.t('hook_'+group_id),
                        value:hook,
                        description:(group_id==hook)?y18n.t('hook_'+hook+'_desc'):y18n.t('hook_'+hook)
                    };
            });         
            return data;
        },
        
        ungroupHooks: function(hooks,apps) {
            var data={};
            data['apps']=apps;
            data['hooks']=hooks;
            if (data['hooks']==undefined)
                data['hooks']=[];
            else if (data['hooks'].constructor !== Array)
                data['hooks']=[data['hooks']];
            if (data['apps']==undefined)
                data['apps']=[];
            else if (data['apps'].constructor !== Array)
                data['apps']=[data['apps']];
            if (data['hooks'].length==0)
                data['ignore_hooks']='';
            if (data['apps'].length==0)
                data['ignore_apps']='';

            // Some hook value contains multiple hooks separated by commas
            var split_hooks=[];
            $.each(data['hooks'], function(i, hook) {
                split_hooks = split_hooks.concat(hook.split(','));
            });

            data['hooks']=split_hooks;
            return data;
        },
    });


    /**
     * Filters
     *
     */
    sam.before(/domains\/add/, function (req){
        // Preload domains list.
        req.params.domains = [];
        req.api('/domains', function(data) {
            req.params.domains = data.domains;
        });
    });
    sam.before(/apps\/install\//, function (req){
        // Preload domains list.
        req.params.domains = [];
        req.api('/domains', function(data) {
            req.params.domains = data.domains;
        });
    });
    sam.before(/apps\/install\//, function (req){
        // Preload users lists.
        req.params.users = [];
        req.api('/users', function(data) {
            req.params.users = data.users;
        });
    });


    sam.before({except: {path: ['#/logout', '#/login', '#/postinstall', '#/postinstall/domain', '#/postinstall/password']}}, function (req) {
        // Store path for further redirections
        store.set('path-1', store.get('path'));
        store.set('path', req.path);

        // Redirect to login page if no credentials stored
        if (!store.get('connected')) {
            req.redirect('#/login');
            return false;
        }
    });

    sam.after(function () {});


    /**
     * Errors
     */
    sam.notFound = function(){
        // Redirect to home page on 404.
        window.location = '#/';
    };


    /**
     * Routes
     *
     * Note: var "c" is Sammy's route context
     * @doc http://sammyjs.org/docs/api/#Sammy.EventContext
     *
     */

     // Home page
    sam.get('#/', function (c) {
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
                $.cookie.json = true;
                var viewedItems = $.cookie('ynhSecurityViewedItems') || [];

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
                $.cookie('ynhSecurityViewedItems', viewedItems, {
                    expire: 7
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

    sam.get('#/login', function (c) {
        $('#masthead').show();
        $('#masthead .logout-btn').hide();
        store.set('path-1', '#/login');
        if ($('div.loader').length === 0) {
            setInterval(function () {
                if (!loaded && $('div.loader').length === 0) {
                    $('#main').append('<div class="loader loader-content"></div>');
                }
            }, 500);
        }

        c.checkInstall(function(isInstalled) {
            if (isInstalled) {
                domain = window.location.hostname;
                $('div.loader').remove();
                c.view('login', { 'domain': domain });
            } else if (typeof isInstalled === 'undefined') {
                if (isInstalledTry > 0) {
                    isInstalledTry--;
                    loaded = false; // Show pacman
                    setTimeout(function() {
                        c.redirect('#/');
                    }, 5000);
                }
                else {
                    // Reset count
                    isInstalledTry = 3;

                    // API is not responding after 3 try
                    $( document ).ajaxError(function( event, request, settings ) {
                        // Display error if status != 200.
                        // .ajaxError fire even with status code 200 because json is sometimes not valid.
                        if (request.status !== 200) c.flash('fail', y18n.t('api_not_responding', [request.status+' '+request.statusText] ));

                        // Unbind directly
                        $(document).off('ajaxError');
                    });

                    // Remove pacman
                    loaded = true;
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

    sam.post('#/login', function (c) {
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

    sam.get('#/logout', function (c) {
        c.api('/logout', function (data) {
            store.clear('url');
            store.clear('connected');
            store.set('path', '#/');
            c.flash('success', y18n.t('logged_out'));
            c.redirect('#/login');
        }, 'GET', {}, false);
    });




    /**
     * Post installation
     *
     */

    // Step 1 : introduction
    sam.get('#/postinstall', function(c) {
        $('#masthead').hide();
        c.checkInstall(function(isInstalled) {
            if (isInstalled || typeof isInstalled === 'undefined') {
                c.redirect('#/login');
            } else {
                c.view('postinstall/postinstall_1');
            }
        });
    });

    // Step 2 : domain
    sam.get('#/postinstall/domain', function(c) {
        $('#masthead').hide();
        $.get('https://dyndns.yunohost.org/domains', function() {})
            .done(function(data){
                c.params.ddomains = data.map(function(dom){return '.'+dom;});
            })
            .fail(function() {
                c.params.ddomains = ['.nohost.me', '.noho.st'];
            })
            .always(function() {
                c.view('postinstall/postinstall_2', c.params, function() {
                    $('#domain, #ddomain').keyup(function(event){
                        if(event.keyCode == 13){
                            $('a.savedomain').click();
                        }
                    });
                    $('a.savedomain').on('click', function(e) {
                        if ($('#domain').val() === '') {
                            if ($('#ddomain').val() === '') {
                                e.preventDefault();
                                store.clear('slide');
                                c.flash('fail', y18n.t('error_select_domain'));
                            } else {
                                domain = $('#ddomain').val() + $('select[name="ddomain-ext"]').val();
                            }
                        } else {
                            domain = $('#domain').val();
                        }
                        store.set('maindomain', domain);
                    });
                });
            });
    });

    // Step 3 : administration passowrd
    sam.get('#/postinstall/password', function(c) {
        $('#masthead').hide();
        if (!store.get('maindomain')) {
            store.clear('slide');
            c.redirect('#/postinstall/domain');
        } else {
            c.view('postinstall/postinstall_3', { 'domain': store.get('maindomain').toLowerCase() });
        }
    });

    // Execute post-installation
    sam.post('#/postinstall', function (c) {
        if (c.params['password'] === '' || c.params['confirmation'] === '') {
            c.flash('fail', y18n.t('password_empty'));
        }
        else if (c.params['password'] == c.params['confirmation']) {
            if (c.params['domain'] === '') {
                c.flash('fail', y18n.t('error_select_domain'));
                store.clear('slide');
                c.redirect('#/postinstall/domain');
            } else {
                params = { 'domain': c.params['domain'].toLowerCase() };
            }

            c.confirm(
                y18n.t('postinstall'),
                y18n.t('confirm_postinstall', [c.params['domain']]),
                function(){
                    params['password'] = c.params['password'];

                    store.set('url', window.location.hostname +'/yunohost/api');
                    store.set('user', 'admin');
                    c.api('/postinstall', function(data) { // http://api.yunohost.org/#!/tools/tools_postinstall_post_0
                        c.redirect('#/login');
                    }, 'POST', params);
                },
                function(){
                }
            );
        } else {
            c.flash('fail', y18n.t('passwords_dont_match'));
        }
    });


    /**
     * Users
     *
     */

    // List existing users
    sam.get('#/users', function (c) {
        c.api('/users', function(data) { // http://api.yunohost.org/#!/user/user_list_get_3
            c.view('user/user_list', data);
        });
    });

    // Create user form
    sam.get('#/users/create', function (c) {
        c.api('/domains', function(data) { // http://api.yunohost.org/#!/domain/domain_list_get_2
            c.view('user/user_create', data);
        });
    });

    // Create user (POST)
    sam.post('#/users', function (c) {
        if (c.params['password'] == c.params['confirmation']) {
            if (c.params['password'].length < 4) {
                c.flash('fail', y18n.t('password_too_short'));
                store.clear('slide');
            }
            else {
                c.params['mail'] = c.params['email'] + c.params['domain'];
                c.api('/users', function(data) { // http://api.yunohost.org/#!/user/user_create_post_2
                    c.redirect('#/users');
                }, 'POST', c.params.toHash());
            }
        } else {
            c.flash('fail', y18n.t('passwords_dont_match'));
            store.clear('slide');
            //c.redirect('#/users/create');
        }
    });

    // Show user information
    sam.get('#/users/:user', function (c) {
        c.api('/users/'+ c.params['user'], function(data) { // http://api.yunohost.org/#!/user/user_info_get_0
            c.view('user/user_info', data);
        });
    });

    // Edit user form
    sam.get('#/users/:user/edit', function (c) {
        c.api('/users/'+ c.params['user'], function(data) { // http://api.yunohost.org/#!/user/user_info_get_0
            c.api('/domains', function(dataDomains) { // http://api.yunohost.org/#!/domain/domain_list_get_2

                // User email use a fake splitted field
                email = data.mail.split('@');
                data.email = {
                    username : email[0],
                    domain : email[1]
                };

                // Domains
                data.domains = [];
                $.each(dataDomains.domains, function(key, value) {
                    data.domains.push({
                        domain: value,
                        selected: (value == data.email.domain) ? true : false
                    });
                });

                c.view('user/user_edit', data);
            });
        });
    });

    // Update user information
    sam.put('#/users/:user', function (c) {
        // Get full user object
        c.api('/users/'+ c.params['user'], function(user) {

            // concat email/domain pseudo field
            if (c.params['mail'] !== c.params['email'] + c.params['domain']) {
                c.params['mail'] = c.params['email'] + c.params['domain'];
            }
            else {
                c.params['mail'] = '';
            }
            // Clear temporary inputs
            c.params['email'] = c.params['domain'] = '';


            // force array type for mail aliases and redirections
            if (typeof c.params['mailalias'] == 'string') {c.params['mailalias'] = [c.params['mailalias']];}
            if (typeof c.params['mailforward'] == 'string') {c.params['mailforward'] = [c.params['mailforward']];}

            // Check for added/removed aliases and redirections
            c.params['add_mailalias'] = c.arrayDiff(c.params['mailalias'], user['mail-aliases']);
            c.params['remove_mailalias'] = c.arrayDiff(user['mail-aliases'], c.params['mailalias']);
            c.params['add_mailforward'] = c.arrayDiff(c.params['mailforward'], user['mail-forward']);
            c.params['remove_mailforward'] = c.arrayDiff(user['mail-forward'], c.params['mailforward']);

            // Clear temporary inputs
            c.params['mailalias'] = c.params['mailforward'] = '';

            // Remove empty inputs
            params = {};
            $.each(c.params.toHash(), function(key, value) {
                if (value.length > 0 && key !== 'user') { params[key] = value; }
            });

            if ($.isEmptyObject(params)) {
                c.flash('fail', y18n.t('error_modify_something'));
                store.clear('slide');
                c.redirect('#/users/'+ c.params['user'] + '/edit');
            } else {
                if (params['password']) {
                    if (params['password'] == params['confirmation']) {
                        if (params['password'].length < 4) {
                            c.flash('fail', y18n.t('password_too_short'));
                            store.clear('slide');
                            c.redirect('#/users/'+ c.params['user'] + '/edit');
                        }
                        else {
                            params['change_password'] = params['password'];
                            c.api('/users/'+ c.params['user'], function(data) { // http://api.yunohost.org/#!/user/user_update_put_1
                                c.redirect('#/users/'+ c.params['user']);
                            }, 'PUT', params);
                        }
                    } else {
                        c.flash('fail', y18n.t('passwords_dont_match'));
                        store.clear('slide');
                        c.redirect('#/users/'+ c.params['user'] + '/edit');
                    }
                }
                else {
                    c.api('/users/'+ c.params['user'], function(data) { // http://api.yunohost.org/#!/user/user_update_put_1
                        c.redirect('#/users/'+ c.params['user']);
                    }, 'PUT', params);
                }
            }
        }, 'GET');
    });

    // Remove existing user
    sam.get('#/users/:user/delete', function (c) {
        c.confirm(
            y18n.t('users'),
            y18n.t('confirm_delete', [c.params['user']]),
            function(){
                c.api('/users/'+ c.params['user'], function(data) { // http://api.yunohost.org/#!/user/user_delete_delete_4
                    c.redirect('#/users');
                }, 'DELETE');
            },
            function(){
                store.clear('slide');
                c.redirect('#/users/'+ c.params['user']);
            }
        );
    });


    /**
     * Domains
     *
     */

    // List existing domains
    sam.get('#/domains', function (c) {
        c.api('/domains', function(data) { // http://api.yunohost.org/#!/domain/domain_list_get_2
            c.api('/domains/main', function(data2) {
                domains = [];
                $.each(data.domains, function(k, domain) {
                    domains.push({
                        url: domain,
                        main: (domain == data2.current_main_domain) ? true : false
                    });
                });

                // Do not show main domain form if we have only 1 domain
                main_domain_form = (domains.length > 1) ? true: false;

                // Sort domains with main domain first
                domains.sort(function(a, b){ return -2*(a.main) + 1; });
                c.view('domain/domain_list', {domains: domains, main_domain_form: main_domain_form});
            }, 'PUT');
        });
    });

    // Add domain form
    sam.get('#/domains/add', function (c) {
        $.get('https://dyndns.yunohost.org/domains', function() {})
            .done(function(data){
                c.params.ddomains = data.map(function(dom){return '.'+dom;});
            })
            .fail(function() {
                c.params.ddomains = ['.nohost.me', '.noho.st'];
            })
            .always(function() {
                data = {
                    ddomains : c.params.ddomains,
                    domains : c.params.domains,
                    allowDyndnsDomain : true
                };

                // Allow only 1 DynDns domain.
                var regex = data.ddomains.join('|');
                $.each(data.domains, function(k, domain) {
                    if ( domain.search(regex) > 0 ) {
                        data.allowDyndnsDomain = false;
                    }
                });

                c.view('domain/domain_add', data);
            });
    });

    // Add domain (POST)
    sam.post('#/domains/add', function (c) {
        if (c.params['domain'] === '') {
            if (c.params['ddomain'] === '') {
                c.flash('fail', y18n.t('error_select_domain'));
                store.clear('slide');
                c.redirect('#/domains/add');
            }
            params = {'domain': c.params['ddomain'] + c.params['ddomain-ext']};
            endurl = 'dyndns';
        } else {
            params = { 'domain': c.params['domain'] };
            endurl = '';
        }

        c.api('/domains?'+endurl, function(data) { // http://api.yunohost.org/#!/domain/domain_add_post_1
            c.redirect('#/domains');
        }, 'POST', params);
    });

    // Remove existing domain
    sam.get('#/domains/:domain/delete', function (c) {
        c.confirm(
            y18n.t('domains'),
            y18n.t('confirm_delete', [c.params['domain']]),
            function(){
                c.api('/domains/'+ c.params['domain'], function(data) { // http://api.yunohost.org/#!/domain/domain_remove_delete_3
                    store.clear('slide');
                    c.redirect('#/domains');
                }, 'DELETE');
            },
            function(){
                store.clear('slide');
                c.redirect('#/domains');
            }
        );
    });

    // Set default domain
    sam.post('#/domains', function (c) {
        if (c.params['domain'] === '') {
            c.flash('fail', y18n.t('error_select_domain'));
            store.clear('slide');
            c.redirect('#/domains');
        } else {
            c.confirm(
                y18n.t('domains'),
                y18n.t('confirm_change_maindomain'),
                function(){
                    params = {'new_domain': c.params['domain']};
                    c.api('/domains/main', function(data) { // http://api.yunohost.org/#!/tools/tools_maindomain_put_1
                        store.clear('slide');
                        c.redirect('#/domains');
                    }, 'PUT', params);

                    // Wait 15s and refresh the page
                    refreshDomain = window.setTimeout(function(){
                        store.clear('slide');
                        c.redirect('#/domains');
                    }, 15000);
                },
                function(){
                    store.clear('slide');
                    c.redirect('#/domains');
                }
            );
        }
    });


    /**
     * Apps
     *
     */

    // List installed apps
    sam.get('#/apps', function (c) {
        c.api('/apps', function(data) { // http://api.yunohost.org/#!/app/app_list_get_8
            // Keep only installed apps
            data2 = { 'apps': [], 'installed_apps': true };
            $.each(data['apps'], function(k, v) {
                if (v['installed']) data2['apps'].push(v);
            });

            c.arraySortById(data2.apps);
            c.view('app/app_list', data2);
        });
    });

    // List available apps
    sam.get('#/apps/install', function (c) {
        c.api('/apps', function(data) { // http://api.yunohost.org/#!/app/app_list_get_8
            c.api('/apps?raw', function(dataraw) { // http://api.yunohost.org/#!/app/app_list_get_8
                // Keep only uninstalled apps, or multi-instance apps
                data2 = { 'apps': [], 'installed_apps': false };
                $.each(data['apps'], function(k, v) {
                    if ((!v['installed'] || dataraw[v['id']].manifest.multi_instance == "true") && !v['id'].match(/__[0-9]{1,5}$/)) {
                        v['install_link']=true;
                        data2['apps'].push(v);
                    }
                });

                // Sort app list
                c.arraySortById(data2.apps);
                c.view('app/app_list', data2);
            });
        });
    });

    // Refresh available apps list
    sam.get('#/apps/refresh', function (c) {
        c.api('/appslists', function(data) { // http://api.yunohost.org/#!/app/app_fetchlist_put_5
            // c.redirect(store.get('path'));
            c.redirect('#/apps/install');
        }, 'PUT');
    });

    // Get app information
    sam.get('#/apps/:app', function (c) {
        c.api('/apps/'+c.params['app']+'?raw', function(data) { // http://api.yunohost.org/#!/app/app_info_get_9
            // Presentation
            data.settings.allowed_users = (data.settings.allowed_users) ? data.settings.allowed_users.replace(',', ', ')+"." : y18n.t('everyone_has_access');

            // Multilingual description
            data.description = (typeof data.manifest.description[y18n.locale] !== 'undefined') ?
                        data.manifest.description[y18n.locale] :
                        data.manifest.description['en']
                        ;

            // Multi Instance settings
            data.manifest.multi_instance = (data.manifest.multi_instance == 'true') ? y18n.t('yes') : y18n.t('no');

            // Installation date
            var d = new Date(data.settings.install_time * 1000);
            data.install_time = d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();

            c.view('app/app_info', data);
        });
    });

    // Get app debug page
    sam.get('#/apps/:app/debug', function (c) {
        c.api('/apps/'+c.params['app']+'/debug', function(data) {
            c.view('app/app_debug', data);
        });
    });

    // Special case for custom app installation.
    sam.get('#/apps/install/custom', function (c) {
        // If we try to GET /apps/install/custom, it means that installation fail.
        // Need to redirect to apps/install to get rid of pacamn and see the log.
        c.redirect('#/apps/install');
    });

    // Helper function that build app installation form
    sam.helper('appInstallForm', function(appId, manifest, params) {
        data = {
            id: appId,
            manifest: manifest
        };

        if (typeof data.manifest.arguments.install !== 'undefined') {
            $.each(data.manifest.arguments.install, function(k, v) {

                // Default values
                data.manifest.arguments.install[k].type = (typeof v.type !== 'undefined') ? v.type : 'string';
                data.manifest.arguments.install[k].inputType = 'text';
                data.manifest.arguments.install[k].required = (typeof v.optional !== 'undefined' && v.optional == "true") ? '' : 'required';

                // Input with choices becomes select list
                if (typeof data.manifest.arguments.install[k].choices !== 'undefined') {
                    // Update choices values with  key and checked data
                    $.each(data.manifest.arguments.install[k].choices, function(ck, cv){
                        data.manifest.arguments.install[k].choices[ck] = {
                            value: cv,
                            label: cv,
                            selected: (cv == data.manifest.arguments.install[k].default) ? true : false,
                        };
                    });
                }

                // Special case for domain input.
                // Display a list of available domains
                if (v.name == 'domain' || data.manifest.arguments.install[k].type == 'domain') {
                    data.manifest.arguments.install[k].choices = [];
                    $.each(params.domains, function(key, domain){
                        data.manifest.arguments.install[k].choices.push({
                            value: domain,
                            label: domain,
                            selected: false
                        });
                    });
                    data.manifest.arguments.install[k].help = "<a href='#/domains'>"+y18n.t('manage_domains')+"</a>";
                }

                // Special case for admin / user input.
                // Display a list of available users
                if (v.name == 'admin' || data.manifest.arguments.install[k].type == 'user') {
                    data.manifest.arguments.install[k].choices = [];
                    $.each(params.users, function(username, user){
                        data.manifest.arguments.install[k].choices.push({
                            value: username,
                            label: user.fullname+' ('+user.mail+')',
                            selected: false
                        });
                    });
                    data.manifest.arguments.install[k].help = "<a href='#/users'>"+y18n.t('manage_users')+"</a>";
                }

                // 'app' type input display a list of available apps
                if (data.manifest.arguments.install[k].type == 'app') {
                    data.manifest.arguments.install[k].choices = [];
                    $.each(params.apps, function(key, app){
                        data.manifest.arguments.install[k].choices.push({
                            value: app.id,
                            label: app.name,
                            selected: false
                        });
                    });
                    data.manifest.arguments.install[k].help = "<a href='#/apps'>"+y18n.t('manage_apps')+"</a>";
                }

                // 'password' type input.
                if (v.name == 'password' || data.manifest.arguments.install[k].type == 'password') {
                    // Change html input type
                    data.manifest.arguments.install[k].inputType = 'password';
                }


                // Multilingual label
                data.manifest.arguments.install[k].label = (typeof data.manifest.arguments.install[k].ask[y18n.locale] !== 'undefined') ?
                                    data.manifest.arguments.install[k].ask[y18n.locale] :
                                    data.manifest.arguments.install[k].ask['en']
                                    ;
            });
        }

        // Multilingual description
        data.description = (typeof data.manifest.description[y18n.locale] !== 'undefined') ?
                                data.manifest.description[y18n.locale] :
                                data.manifest.description['en']
                                ;

        // Multi Instance settings boolean to text
        data.manifest.multi_instance = (data.manifest.multi_instance == 'true') ? y18n.t('yes') : y18n.t('no');

        // View app install form
        c.view('app/app_install', data);
        return;
    });

    // App installation form
    sam.get('#/apps/install/:app', function (c) {
        c.api('/apps?raw', function(data) { // http://api.yunohost.org/#!/app/app_list_get_8

            c.appInstallForm(
                c.params['app'],
                data[c.params['app']].manifest,
                c.params
            );

        });
    });

    // Install app (POST)
    sam.post('#/apps', function(c) {
        // Warn admin if app is going to be installed on domain root.
        if (c.params['path'] !== '/' || confirm(y18n.t('confirm_install_domain_root', [c.params['domain']]))) {
            params = { 'label': c.params['label'], 'app': c.params['app'] };
            delete c.params['label'];
            delete c.params['app'];
            params['args'] = c.serialize(c.params.toHash());
            // Do not pass empty args.
            if (params['args'] === "") {
                delete params['args'];
            }

            c.api('/apps', function() { // http://api.yunohost.org/#!/app/app_install_post_2
                c.redirect('#/apps');
            }, 'POST', params);
        }
        else {
            c.flash('warning', y18n.t('app_install_cancel'));
            store.clear('slide');
            c.redirect('#/apps/install');
        }
    });

    // Install custom app from github
    sam.post('#/apps/install/custom', function(c) {

        params = { 'label': c.params['label'], 'app': c.params['url'] };
        delete c.params['label'];
        delete c.params['url'];

        c.confirm(
            y18n.t('applications'),
            y18n.t('confirm_install_custom_app'),
            function(){

                // Force trailing slash
                params.app = params.app.replace(/\/?$/, '/');

                // Get manifest.json to get additional parameters
                jQuery.ajax({
                    url: params.app.replace('github.com', 'raw.githubusercontent.com') + 'master/manifest.json',
                    type: 'GET',
                })
                .done(function(manifest) {
                    // raw.githubusercontent.com serve content as plain text
                    manifest = jQuery.parseJSON(manifest) || {};

                    c.appInstallForm(
                        params.app,
                        manifest,
                        c.params
                    );

                })
                .fail(function(xhr) {
                    c.flash('fail', y18n.t('app_install_custom_no_manifest'));
                    store.clear('slide');
                    c.redirect('#/apps/install');
                });
            },
            function(){
                c.flash('warning', y18n.t('app_install_cancel'));
                store.clear('slide');
                c.redirect('#/apps/install');
            }
        );
    });

    // Remove installed app
    sam.get('#/apps/:app/uninstall', function (c) {
        c.confirm(
            y18n.t('applications'),
            y18n.t('confirm_uninstall', [c.params['app']]),
            function() {
                c.api('/apps/'+ c.params['app'], function() { // http://api.yunohost.org/#!/app/app_remove_delete_4
                    c.redirect('#/apps');
                }, 'DELETE');
            },
            function() {
                store.clear('slide');
                c.redirect('#/apps/'+ c.params['app']);
            }
        );
    });

    // Manage app access
    sam.get('#/apps/:app/access', function (c) {
        c.api('/apps/'+c.params['app']+'?raw', function(data) { // http://api.yunohost.org/#!/app/app_info_get_9
            c.api('/users', function(dataUsers) {

                // allowed_users as array
                if (typeof data.settings.allowed_users !== 'undefined') {
                    if (data.settings.allowed_users.length === 0) {
                        // Force empty array, means no user has access
                        data.settings.allowed_users = [];
                    }
                    else {
                        data.settings.allowed_users = data.settings.allowed_users.split(',');
                    }
                } else {
                    data.settings.allowed_users = []; // Force array
                    // if 'allowed_users' is undefined, everyone has access
                    // that means that undefined is different from empty array
                    data.settings.allow_everyone = true;
                }

                // Available users
                data.users = [];
                $.each(dataUsers.users, function(username, user){
                    // Do not list allowed_users in select list
                    if ( data.settings.allowed_users.indexOf(username) === -1 ) {
                        data.users.push({
                            value: username,
                            label: user.fullname+' ('+user.mail+')'
                        });
                    } else {
                        // Complete allowed_users data
                        data.settings.allowed_users[data.settings.allowed_users.indexOf(username)] = {
                            username: username,
                            fullname: user.fullname,
                            mail: user.mail,
                        };
                    }
                });

                c.view('app/app_access', data);
            });
        });
    });

    // Remove all access
    sam.get('#/apps/:app/access/remove', function (c) {
        c.confirm(
            y18n.t('applications'),
            y18n.t('confirm_access_remove_all', [c.params['app']]),
            function() {
                params = {'apps': c.params['app'], 'users':[]};
                c.api('/access?'+c.serialize(params), function(data) { // http://api.yunohost.org/#!/app/app_removeaccess_delete_12
                    store.clear('slide');
                    c.redirect('#/apps/'+ c.params['app']+ '/access');
                }, 'DELETE', params);
            },
            function() {
                store.clear('slide');
                c.redirect('#/apps/'+ c.params['app']+ '/access');
            }
        );
    });

    // Remove access to a specific user
    sam.get('#/apps/:app/access/remove/:user', function (c) {
        c.confirm(
            y18n.t('applications'),
            y18n.t('confirm_access_remove_user', [c.params['app'], c.params['user']]),
            function() {
                params = {'apps': c.params['app'], 'users': c.params['user']};
                c.api('/access?'+c.serialize(params), function(data) { // http://api.yunohost.org/#!/app/app_removeaccess_delete_12
                    store.clear('slide');
                    c.redirect('#/apps/'+ c.params['app']+ '/access');
                }, 'DELETE', params); // passing 'params' here is useless because jQuery doesn't handle ajax datas for DELETE requests. Passing parameters through uri.
            },
            function() {
                store.clear('slide');
                c.redirect('#/apps/'+ c.params['app']+ '/access');
            }
        );
    });

    // Grant all access
    sam.get('#/apps/:app/access/add', function (c) {
        c.confirm(
            y18n.t('applications'),
            y18n.t('confirm_access_add', [c.params['app']]),
            function() {
                params = {'apps': c.params['app'], 'users': null};
                c.api('/access', function() { // http://api.yunohost.org/#!/app/app_addaccess_put_13
                    store.clear('slide');
                    c.redirect('#/apps/'+ c.params['app'] +'/access');
                }, 'PUT', params);
            },
            function() {
                store.clear('slide');
                c.redirect('#/apps/'+ c.params['app']+ '/access');
            }
        );
    });

    // Grant access for a specific user
    sam.post('#/apps/:app/access/add', function (c) {
        params = {'users': c.params['user'], 'apps': c.params['app']};
        c.api('/access', function() { // http://api.yunohost.org/#!/app/app_addaccess_put_13
            store.clear('slide');
            c.redirect('#/apps/'+ c.params['app'] +'/access');
        }, 'PUT', params);
    });

    // Clear access (reset)
    sam.get('#/apps/:app/access/clear', function (c) {
        c.confirm(
            y18n.t('applications'),
            y18n.t('confirm_access_clear', [c.params['app']]),
            function() {
                params = {'apps': c.params['app']};
                c.api('/access', function() { //
                    store.clear('slide');
                    c.redirect('#/apps/'+ c.params['app'] +'/access');
                }, 'POST', params);
            },
            function() {
                store.clear('slide');
                c.redirect('#/apps/'+ c.params['app']+ '/access');
            }
        );
    });

    // Make app default
    sam.get('#/apps/:app/default', function (c) {
        c.confirm(
            y18n.t('applications'),
            y18n.t('confirm_app_default'),
            function() {
                c.api('/apps/'+ c.params['app']  +'/default', function() { //
                    store.clear('slide');
                    c.redirect('#/apps/'+ c.params['app']);
                }, 'PUT');
            },
            function() {
                store.clear('slide');
                c.redirect('#/apps/'+ c.params['app']);
            }
        );
    });


    /**
     * Services
     *
     */

    // All services status
    sam.get('#/services', function (c) {
        c.api('/services', function(data) { // ?
            data2 = { 'services': [] };
            $.each(data, function(k, v) {
                v.name = k;
                // Handlebars want booleans
                v.is_loaded = (v.loaded=='enabled') ? true : false;
                v.is_running = (v.status=='running') ? true : false;
                // Translate status and loaded state
                v.status = y18n.t(v.status);
                v.loaded = y18n.t(v.loaded);
                data2.services.push(v);
            });
            c.view('service/service_list', data2);
        });
    });

    // Status & actions for a service
    sam.get('#/services/:service', function (c) {
        c.api('/services/'+ c.params['service'], function(data) { // ?
            data2 = { 'service': data };
            data2.service.name = c.params['service'];
            // Handlebars want booleans
            data2.service.is_loaded = (data.loaded=='enabled') ? true : false;
            data2.service.is_running = (data.status=='running') ? true : false;
            // Translate status and loaded state
            data2.service.status = y18n.t(data.status);
            data2.service.loaded = y18n.t(data.loaded);
            store.clear('slide');
            c.view('service/service_info', data2);
        }, 'GET');
    });

    // Service log
    sam.get('#/services/:service/log', function (c) {
        params = { 'number': 50 };
        c.api('/services/'+ c.params['service'] +'/log', function(data) { // ?
            data2 = { 'logs': [], 'name': c.params['service'] };
            $.each(data, function(k, v) {
                data2.logs.push({filename: k, filecontent: v.join('\n')});
            });

            c.view('service/service_log', data2);
        }, 'GET', params);
    });

    // Enable/Disable & Start/Stop service
    sam.get('#/services/:service/:action', function (c) {
        c.confirm(
            "Service",
            y18n.t('confirm_service_action', [y18n.t(c.params['action']), c.params['service']]),
            function(){
                var method = null, endurl = c.params['service'];

                switch (c.params['action']) {
                    case 'start':
                        method = 'PUT';
                        break;
                    case 'stop':
                        method = 'DELETE';
                        break;
                    case 'enable':
                        method = 'PUT';
                        endurl += '/enable';
                        break;
                    case 'disable':
                        method = 'DELETE';
                        endurl += '/enable';
                        break;
                    default:
                        c.flash('fail', y18n.t('unknown_action', [c.params['action']]));
                        store.clear('slide');
                        c.redirect('#/services/'+ c.params['service']);
                }

                if (method && endurl) {
                    c.api('/services/'+ endurl, function(data) {
                        store.clear('slide');
                        c.redirect('#/services/'+ c.params['service']);
                    }, method);
                }
                else {
                    store.clear('slide');
                    c.redirect('#/services/'+ c.params['service']);
                }
            },
            function(){
                store.clear('slide');
                c.redirect('#/services/'+ c.params['service']);
            }
        );
    });


    /**
     * Firewall
     *
     */

    // Firewall status
    sam.get('#/tools/firewall', function (c) {
        c.api('/firewall?raw', function(data) {
            var firewall = {
                ports : {},
                upnp : false
            };

            // Reorganize ports
            $.each(['ipv4', 'ipv6', 'uPnP'], function(i, protocol) {
                $.each(['TCP', 'UDP'], function(j, connection) {
                    firewall.ports[connection] = firewall.ports[connection] || {}; 
                    $.each(data[protocol][connection], function(k, port) {
                        firewall.ports[connection][port] = firewall.ports[connection][port] || {}; 
                        firewall.ports[connection][port][protocol] = true;
                    });
                });
            });

            // Get UPnP status
            firewall.upnp = data.uPnP.enabled;

            c.view('tools/tools_firewall', firewall);
        });
    });

    // Enable/Disable UPnP
    sam.get('#/tools/firewall/upnp/:action', function (c) {
        c.confirm(
            y18n.t('firewall'),
            y18n.t('confirm_upnp_action', [y18n.t(c.params['action'])]),
            function(){
                params = {'action' : c.params['action']};
                c.api('/firewall/upnp', function(data) {
                    store.clear('slide');
                    c.redirect('#/tools/firewall');
                }, 'GET', params);
            },
            function(){
                store.clear('slide');
                c.redirect('#/tools/firewall');
            }
        );
    });

    // Toggle port status helper (available in every controller)
    sam.helper('togglePort', function(port, protocol, connection, action) {
        var method = null,
              endurl = [],
              c = this
        ;

        if (port != parseInt(port) || port < 0 || port > 65535) {
            c.flash('fail', y18n.t('unknown_argument', [port]));
            store.clear('slide');
            c.redirect('#/tools/firewall');
        }

        switch (connection) {
            case 'ipv4':
                endurl = 'ipv4_only';
                break;
            case 'ipv6':
                endurl = 'ipv6_only';
                break;
        }

        switch (protocol) {
            case 'udp':
                protocol = 'UDP';
                break;
            case 'both':
                protocol = 'Both';
                break;
            default:
                protocol = 'TCP';
        }

        switch (action) {
            case "open":
                method = 'POST';
                break;
            case "close":
                method = 'DELETE';
                break;
            default:
                c.flash('fail', y18n.t('unknown_action', [action]));
                store.clear('slide');
                c.redirect('#/tools/firewall');
        }

        if (method !== null && protocol !== null && port !== null) {
            // port:
            // protocol:
            //    - UDP
            //    - TCP
            //    - Both
            // --ipv4-only:
            // --ipv6-only:
            // --no-upnp:
            var params = {
                'port' : port,
                'protocol' : protocol,
            };
            c.api('/firewall/port?'+endurl, function(data) {
                store.clear('slide');
                c.redirect('#/tools/firewall');
            }, method, params);
        }
        else {
            store.clear('slide');
            c.redirect('#/tools/firewall');
        }
        return;
    });

    // Update port status from direct link
    // #/firewall/port/{{@key}}/tcp/ipv4/close
    sam.get('#/tools/firewall/port/:port/:protocol/:connection/:action', function (c) {
        c.confirm(
            y18n.t('firewall'),
            y18n.t( 'confirm_firewall', [ y18n.t(c.params['action']), c.params['port'], y18n.t(c.params['protocol']), y18n.t(c.params['connection'])]),
            function(){
                c.togglePort(
                    c.params['port'],
                    c.params['protocol'],
                    c.params['connection'],
                    c.params['action']
                );
            },
            function(){
                store.clear('slide');
                c.redirect('#/tools/firewall');
            }
        );
    });

    // Update port status from form
    sam.post('#/tools/firewall/port', function (c) {
        c.confirm(
            y18n.t('firewall'),
            y18n.t('confirm_firewall', [ y18n.t(c.params['action']), c.params['port'], y18n.t(c.params['protocol']), y18n.t(c.params['connection']) ]),
            function(){
                c.togglePort(
                    c.params['port'],
                    c.params['protocol'],
                    c.params['connection'],
                    c.params['action']
                );
            },
            function(){
                store.clear('slide');
                c.redirect('#/tools/firewall');
            }
        );
    });


    /**
     * Monitor
     *
     */

    // Server monitoring
    sam.get('#/tools/monitor', function (c) {
        monitorData = {};

        // Why this method ?
        c.api('/services/glances', function(data) { // ?
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

                            // Get YunoHost versions too
                            c.api('/version', function(versions) {
                                monitorData.versions = versions;
                                c.view('tools/tools_monitoring', monitorData);
                            });
                        });

                    });
                });
            }
            else {
                monitorData.status = false;
                c.view('tools/tools_monitoring', monitorData);
            }

        }, 'GET');
    });


    /**
     * Tools
     *
     */

    // Tools list
    sam.get('#/tools', function (c) {
        c.view('tools/tools_list');
    });

    // Update administration password
    sam.get('#/tools/adminpw', function (c) {
        c.view('tools/tools_adminpw');
    });

    // Update administration password (PUT)
    sam.put('#/tools/adminpw', function (c) {
        params = {};
        $.each(c.params.toHash(), function(key, value) {
            if (value !== '') { params[key] = value; }
        });
        if ($.isEmptyObject(params)) {
            c.flash('fail', y18n.t('error_modify_something'));
            store.clear('slide');
            c.redirect('#/tools/adminpw');
        } else if (params['new_password'] !== params['confirm_new_password']) {
            c.flash('fail', y18n.t('passwords_dont_match'));
            store.clear('slide');
            c.redirect('#/tools/adminpw');
        } else {
            c.api('/login', function(data) {
                // Remove useless variable
                delete params['old_password'];
                delete params['confirm_new_password'];

                // Update password and redirect to the home
                c.api('/adminpw', function(data) { // http://api.yunohost.org/#!/tools/tools_adminpw_put_3
                    c.redirect('#/logout');
                }, 'PUT', params);
            }, 'POST', { 'password': params['old_password'] }, false);
        }
    });

    // System update & upgrade
    sam.get('#/update', function (c) {
        c.api('/update', function(data) {
            packagesLength = data.packages.length;
            for(var i = 0; i < packagesLength; i++) {
                data.packages[i].delayed = false;
                data.packages[i].changelog = data.packages[i].changelog.replace(/\n/g, '<br />');

                // Check for special packages that need delayed upgrade.
                if (["moulinette", "moulinette-yunohost", "yunohost-admin", "yunohost-config-nginx", "ssowat", "python"].indexOf(data.packages[i].name) != -1) {
                    c.flash('warning', y18n.t('system_delayed_upgrade_warning', [data.packages[i].name]));
                    data.packages[i].delayed = true;
                }
            }
            c.view('update/update', data);
        }, 'PUT');
    });

    // Upgrade apps or packages
    sam.get('#/upgrade/:type', function (c) {
        if (c.params['type'] !== 'apps' && c.params['type'] !== 'packages') {
            c.flash('fail', y18n.t('unknown_argument', [c.params['type']]));
            store.clear('slide');
            c.redirect('#/update');
        }
        else {
            c.confirm(
                y18n.t('tools'),
                y18n.t('confirm_update_type', [y18n.t('system_'+c.params['type']).toLowerCase()]),
                function(){
                    endurl = '';
                    if (c.params['type'] == 'packages') {endurl = 'ignore_apps';}
                    else if (c.params['type'] == 'apps') {endurl = 'ignore_packages';}

                    c.api('/upgrade?'+endurl, function(data) {
                        // 'log' is a reserved name, maybe in handlebars
                        data.logs = data.log;
                        c.view('upgrade/upgrade', data);
                    }, 'PUT');

                },
                function(){
                    store.clear('slide');
                    c.redirect('#/update');
                }
            );
        }
    });

    // Download SSL Certificate Authority
    sam.get('#/tools/ca', function (c) {
        c.view('tools/tools_ca');
    });

    // Security feed
    sam.get('#/tools/security-feed', function (c) {
        data = {
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
                data.items.push(item);
            });

            c.view('tools/tools_security_feed', data);
        })
        .fail(function() {
            c.flash('fail', y18n.t('error_retrieve_feed', [securityFeed]));
        });

    });

    // Security feed
    sam.get('#/tools/versions', function (c) {
        c.api('/version', function(versions) {
            c.view('tools/tools_versions', {'versions' : versions});
        });
    });


    /**
     * Backup
     *
     */
    
    var config_hooks = [
        'system_ldap',
        'system_ssowat',
        'system_cron',
        'system_ssh',
        'system_xmpp',
        'system_mysql',
        'system_yunohost',
        'system_nginx'
    ];
    // Storage list
    sam.get('#/backup', function (c) {
        var storages = [];
        
        var item = {
                id: 'local',
                name: y18n.t('local_archives'),
                uri: '/home/yunohost.backup/'
            };
        storages.push(item);
        
        c.view('backup/backup', {'storages':storages});
    });
    
    // Storage list
    sam.get('#/storages/create', function (c) {        
        c.view('backup/storage_create', {});
    });
    
    // Create a storage
    sam.post('#/storages', function (c) {   
        store.clear('slide');
        c.redirect('#/storages');
    });
    
    // Create a backup
    sam.get('#/backup/:storage/create', function (c) {
        var data=[];
        data['storage']={
            id:c.params['storage'],
            name:y18n.t('local_archives')
        };  
        c.api('/hooks/backup', function(hooks) {  
            data['hooks']=c.groupHooks(hooks['hooks']);
            data['apps']={};
            c.api('/apps?raw', function(apps) { // http://api.yunohost.org/#!/app/app_list_get_8
                $.each(apps, function(app_id, app) {
                    if (app['installed'])
                        data['apps'][app_id]={
                            id: app_id,
                            name: app['manifest']['name']
                        };
                });
                c.view('backup/backup_create', data);
            });
        });
        
    });
    
    
    sam.post('#/backup/:storage', function (c) {
        var params = c.ungroupHooks(c.params['hooks'],c.params['apps']);
        c.api('/backup', function() {
            store.clear('slide');
            c.redirect('#/backup/'+ c.params['storage']);
        }, 'POST', params);
    });
    
    // Restore a backup
    sam.post('#/backup/:storage/:archive/restore', function (c) {
        c.confirm(
            y18n.t('backup'),
            y18n.t('confirm_restore', [c.params['archive']]),
            $.proxy(function(c){
                var params=c.ungroupHooks(c.params['hooks'],c.params['apps']);
                params['force']='';
                c.api('/backup/restore/'+c.params['archive'], function(data) {            
                    store.clear('slide');
                    c.redirect('#/backup/'+ c.params['storage']+'/'+c.params['archive']);
                }, 'POST', params);
            },this,c),
            function(){
                store.clear('slide');
                c.redirect('#/backup/'+ c.params['storage']+'/'+c.params['archive']);
            }
        );
        
    });
    
    // Delete a backup
    sam.get('#/backup/:storage/:archive/delete', function (c) {
        c.confirm(
            y18n.t('backup'),
            y18n.t('confirm_delete', [c.params['archive']]),
            function(){
                c.api('/backup/archives/'+c.params['archive'], function(data) { 
                    c.redirect('#/backup/'+ c.params['storage']);
                }, 'DELETE');
            },
            function(){
                store.clear('slide');
                c.redirect('#/backup/'+ c.params['storage']+'/'+c.params['archive']);
            }
        );
    });
    
    // Download a backup
    sam.get('#/backup/:storage/:archive/download', function (c) {
        c.api('/backup/'+c.params['archive']+'/download', function(data) { 
            c.redirect('#/backup/'+ c.params['storage']+'/'+c.params['archive']);
        }, 'GET');
    });
    
    // Copy a backup
    sam.get('#/backup/:storage/:archive/copy', function (c) {
        store.clear('slide');
        c.redirect('#/backup/'+ c.params['storage']+'/'+c.params['archive']);  
    });
    
    // Upload a backup
    sam.get('#/backup/:storage/:archive/upload', function (c) {
        store.clear('slide');
        c.redirect('#/backup/'+ c.params['storage']+'/'+c.params['archive']);        
    });
    
    
    // Get archive info
    sam.get('#/backup/:storage/:archive', function (c) {
        c.api('/backup/archives/'+c.params['archive']+'?with_details', function(data) { 
            data['storage']={
                id:c.params['storage'],
                name:y18n.t('local_archives')
            };
            data['other_storages']=[];
            data['name']=c.params['archive'];
            data['hooks']=c.groupHooks(Object.keys(data['hooks']));
            data['items']=(data['hooks']!={} || data['apps']!=[]); 
            c.view('backup/backup_info', data);
        });
    });
    
    
    // Archive list
    sam.get('#/backup/:storage', function (c) {
        c.api('/backup/archives?with_info', function(data) { 
            data['storage']={
                id:'local',
                name:y18n.t('local_archives')
            };
            data['archives2']=[];
            $.each(data['archives'], function(name, info) {
                info['name']=name;
                data['archives2'].unshift(info)
            });
            data['archives']=data['archives2'];
            c.view('backup/backup_list', data);
        });
    });
    

});


/**
 * Translations
 */
$.getJSON('locales/en.json', function(data){
    y18n.translations['en'] = data;
    y18n.translateInlineHTML();
});

// User defined language
if (window.navigator && window.navigator.language) {
    y18n.locale = window.navigator.language.substr(0, 2);
    if (y18n.locale !== 'en') {
        $.getJSON('locales/'+ y18n.locale +'.json', function(data){
            y18n.translations[y18n.locale] = data;
            y18n.translateInlineHTML();
        });
    }
}


/**
 * Run the app
 *
 */
$(document).ready(function () {

    /**
     * Application
     */
    app.run('#/');
});
