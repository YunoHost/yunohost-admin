(function() {
    // Get application context
    var app = Sammy.apps['#main'];
    var store = app.store;

    /**
     * Helpers
     *
     */
    app.helpers({

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
                    $('#main').append('<div class="loader loader-content"></div>');
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
                        var errorMessage = xhr.status+' '+xhr.statusText;
                        // If some more text is available, display it to user.
                        if (typeof xhr.responseText !== 'undefined') {
                            errorMessage += ' - ' + xhr.responseText;
                        }
                        c.flash('fail', y18n.t('api_not_responding', [errorMessage]));
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
                    if (rule.isIn(hook)) {
                        group_id = 'adminjs_group_'+rule.id;
                        return false;
                    }
                });

                if(group_id in data) {
                    data[group_id] = {
                        name:y18n.t('hook_'+group_id),
                        value:data[group_id].value+','+hook,
                        description:data[group_id].description+', '+y18n.t('hook_'+hook)
                    };
                }
                else {
                    data[group_id] = {
                        name:y18n.t('hook_'+group_id),
                        value:hook,
                        description:(group_id==hook)?y18n.t('hook_'+hook+'_desc'):y18n.t('hook_'+hook)
                    };
                }
            });         
            return data;
        },
        
        ungroupHooks: function(hooks,apps) {
            var data={};
            data['apps'] = apps || [];
            data['hooks'] = hooks || [];
            
            if (data['hooks'].constructor !== Array) {
                data['hooks'] = [data['hooks']];
            }
            if (data['apps'].constructor !== Array) {
                data['apps'] = [data['apps']];
            }

            if (data['hooks'].length == 0) {
                data['ignore_hooks'] = '';
            }
            if (data['apps'].length == 0) {
                data['ignore_apps'] = '';
            }

            // Some hook value contains multiple hooks separated by commas
            var split_hooks = [];
            $.each(data['hooks'], function(i, hook) {
                split_hooks = split_hooks.concat(hook.split(','));
            });
            data['hooks'] = split_hooks;

            return data;
        },
    });

})();