(function() {
    // Get application context
    var app = Sammy.apps['#main'];
    var store = app.store;

    // The logic used to temporily disable transition is from
    // https://stackoverflow.com/a/16575811
    function whichTransitionEvent(){
        var t;
        var el = document.createElement('fakeelement');
        var transitions = {
          'transition':'transitionend',
          'OTransition':'oTransitionEnd',
          'MozTransition':'transitionend',
          'WebkitTransition':'webkitTransitionEnd'
        }

        for(t in transitions){
            if( el.style[t] !== undefined ){
                return transitions[t];
            }
        }
    };
    var transitionEvent = whichTransitionEvent();

    function resetSliders()
    {
        // Disable transition effects
        $('#slider-container').addClass('notransition');
        // Delete the left/right temporary stuff only used during animation
        $('#slideTo').css('display', 'none');
        $('#slideBack').css('display', 'none');
        // Set the margin-left back to 0
        $('#slider-container').css('margin-left', '0');
        // c.f. the stackoverflow thread
        $('#slider-container')[0].offsetHeight;
        // Remove the binding to this event handler for next times
        //$("#slider-container").off(transitionEvent);
        // Re-enable transition effects
        $('#slider-container').removeClass('notransition');
    }
    // Now we add the transition event to detect the end of the transition effect
    transitionEvent && $("#slider-container").on(transitionEvent, resetSliders)


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

            message = message.split("\n").join("<br />");

            // If the message starts with a progress bar
            progressbar = message.match(/^\[#*\+*\.*\] > /);
            if (progressbar)
            {
                progressbar = progressbar[0];
                // Remove the progress bar from the mesage
                message = message.replace(progressbar,"");
                // Compute percent
                done = (progressbar.match(/#/g)||[]).length;
                ongoing = (progressbar.match(/\+/g)||[]).length;
                remaining = (progressbar.match(/\./g)||[]).length;
                total = done + ongoing + remaining;
                done = done * 100 / total;
                ongoing = ongoing * 100 / total;
                // Actually build the message with the progress bar
                message = '<div class="progress"><div class="progress-bar progress-bar-success" role="progressbar" style="width:'+done+'%"></div><div class="progress-bar progress-bar-striped active" role="progressbar" style="width:'+ongoing+'%;"></div></div><p style="display: inline-block;">' + message + '</p>';
            }
            else
            {
                message = '<p>'+message+'</p>';
            }

            // Add message
            $('#flashMessage .messages')
                .prepend('<div class="alert alert-'+ level +'">'+message+'</div>');

            // Scroll to top to view new messages
            $('#flashMessage').scrollTop(0);
        },

        checkInstall: function(callback) {
            // Get base url from store or guess from current url
            var baseUrl = (store.get('url') !== null) ? store.get('url')
                            : window.location.hostname + '/yunohost/api';

            // Call API endpoint
            $.ajax({
                dataType: "json",
                url: 'https://'+ baseUrl +'/installed',
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
        api: function(method, uri, data, callback, callbackOnFailure, websocket) {
            c = this;

            method = typeof method !== 'undefined' ? method : 'GET';
            data   = typeof data   !== 'undefined' ? data   : {};
            if (window.navigator && window.navigator.language && (typeof data.locale === 'undefined')) {
                data.locale = y18n.locale || window.navigator.language.substr(0, 2);
            }
            app.loaded = false;
            if ($('div.loader').length === 0) {
                $('#main').append('<div class="loader loader-content"></div>');
            }
            call = function(uri, callback, method, data, callbackOnFailure) {

                var args = data;
                // TODO: change this code
                if (uri === '/postinstall') {
                    var post_installing = false;
                    setInterval(function () {
                        post_installing = true;
                    }, 1500);
                }

                if (typeof callbackOnFailure !== 'function') {
                    callbackOnFailure = function(xhr) {
                        // Postinstall is a custom case, we have to wait that
                        // operation is done before doing anything
                        if ((uri === '/postinstall') && (post_installing)) {
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
                        }
                        // Regular errors
                        else {
                            if (xhr.status == 200) {
                                // Fail with 200, WTF
                                callback({});
                            }
                            // Unauthorized or wrong password
                            else if (xhr.status == 401) {
                                if (uri === '/login') {
                                    c.flash('fail', y18n.t('wrong_password'));
                                } else {
                                    c.flash('fail', y18n.t('unauthorized'));
                                    c.redirect('#/login');
                                }
                            }
                            // 500
                            else if (xhr.status == 500) {
                                try {
                                    error_log = JSON.parse(xhr.responseText);
                                    error_log.route = error_log.route.join(' ') + '\n';
                                    error_log.arguments = JSON.stringify(error_log.arguments);
                                }
                                catch (e)
                                {
                                    error_log = {};
                                    error_log.route = "Failed to parse route";
                                    error_log.arguments = "Failed to parse arguments";
                                    error_log.traceback = xhr.responseText;
                                }
                                c.flash('fail', y18n.t('internal_exception', [error_log.route, error_log.arguments, error_log.traceback]));
                            }
                            // 502 Bad gateway means API is down
                            else if (xhr.status == 502) {
                                c.flash('fail', y18n.t('api_not_responding'));
                            }
                            // More verbose error messages first
                            else if (typeof xhr.responseText !== 'undefined') {
                                c.flash('fail', xhr.responseText);
                            }
                            // 0 mean "the connexion has been closed" apparently
                            else if (xhr.status == 0) {
                                var errorMessage = xhr.status+' '+xhr.statusText;
                                c.flash('fail', y18n.t('error_connection_interrupted', [errorMessage]));
                                console.log(xhr);
                            }
                            // Return HTTP error code at least
                            else {
                                var errorMessage = xhr.status+' '+xhr.statusText;
                                c.flash('fail', y18n.t('error_server_unexpected', [errorMessage]));
                                console.log(xhr);
                            }

                            // Remove loader if any
                            $('div.loader').remove();

                            // Force scrollTop on page load
                            $('html, body').scrollTop(0);
                            store.clear('slide');
                        }
                    };
                }

                jQuery.ajax({
                    url: 'https://' + store.get('url') + uri,
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
                .fail(callbackOnFailure);
            };

            websocket = typeof websocket !== 'undefined' ? websocket : true;
            if (websocket) {
                // Open a WebSocket connection to retrieve live messages from the moulinette
                var ws = new WebSocket('wss://'+ store.get('url') +'/messages');
                // Flag to avoid to call twice the API
                // We need to set that in ws object as we need to use it in ws.onopen
                // and several ws object could be running at the same time...
                ws.api_called = false;
                ws.onmessage = function(evt) {
                    // console.log(evt.data);
                    $.each($.parseJSON(evt.data), function(k, v) {
                        c.flash(k, v);
                    });
                };

                // If not connected, WebSocket connection will raise an error, but we do not want to interrupt API request
                ws.onerror = function () {
                    ws.onopen();
                };

                ws.onclose = function() { };

                ws.onopen = function () {
                    if (!ws.api_called) {
                        ws.api_called = true;
                        call(uri, callback, method, data, callbackOnFailure);
                    }
                };
            } else {
                call(uri, callback, method, data, callbackOnFailure);
            }

        },

        // Render view (cross-browser)
        view: function (view, data, callback, enableSlide) {
            c = this;

            // Default
            callback = typeof callback !== 'undefined' ? callback : function() {};
            enableSlide = (typeof enableSlide !== 'undefined') ? enableSlide : true; // Change to false to disable animation

            app.loaded = true;

            // Hide loader and modal
            $('div.loader').remove();
            $('#modal').modal('hide');

            // Render content
            var rendered = this.render('views/'+ view +'.ms', data);

            // Update content helper
            var leSwap = function() {
                rendered.swap(function() {
                    // Slide direction
                    if (enableSlide) {
                        $('.slide, .btn-breadcrumb a:not(:last-child)').on('click', function() {
                            $(this).addClass('active');
                            if ($(this).hasClass('back') || $(this).parent('.btn-breadcrumb').length) {
                                store.set('slide', 'back');
                            } else {
                                store.set('slide', 'to');
                            }
                        });
                    }

                    // Paste <pre> helper
                    c.prePaste();

                    // Run callback
                    callback();

                    // Force scrollTop on page load
                    $('html, body').scrollTop(0);
                });
            };

            // Slide back effect
            if (enableSlide && store.get('slide') == 'back') {

                store.clear('slide');
                // Disable transition while we tweak CSS
                $('#slider-container').addClass('notransition');
                // "Delete" the left part of the slider
                $('#slideBack').css('display', 'none');

                // Push the slider to the left
                $('#slider-container').css('margin-left', '-100%');
                // slideTo is the right part, and should contain the old view,
                // so we copypasta what's in the "center" slider (#main)
                $('#slideTo').show().html($('#main').html());
                // leSwap will put the new view in the "center" slider (#main)
                leSwap();

                // So now things look like:
                //                          |                 |
                //                          |   the screen    |
                //                          |                 |
                //
                //       .     #main        .    #slideTo     .
                //       .  the new view    .  the old view   .
                //       ^                          ^
                //  margin-left: -100%             currently shown
                //
                //            =====>>>  sliiiiide  =====>>>

                // Re-add transition effect
                $('#slider-container').removeClass('notransition');
                // And actually play the transition effect that will move the container from left to right
                $('#slider-container').css('margin-left', '0px');
            }
            // Slide to effect
            else if (enableSlide && store.get('slide') == 'to') {
                store.clear('slide');
                // Disable transition while we tweak CSS
                $('#slider-container').addClass('notransition');
                // "Delete" the right part of the slider
                $('#slideTo').css('display', 'none');
                // Push the slider to the right
                $('#slider-container').css('margin-left', '0px');
                // slideBack should contain the old view,
                // so we copypasta what's in the "center" slider (#main)
                $('#slideBack').show().html($('#main').html());
                leSwap();

                // So now things look like:
                //
                //                    |                 |
                //                    |   the screen    |
                //                    |                 |
                //
                //      .             .   #slideBack    .     #main      .
                //      .             .  the old view   .  the new view  .
                //      ^             ^        ^
                //   margin-left: -100%      currently shown
                //
                //               <<<===== sliiiiide <<<=======


                // Re-add transition effect
                $('#slider-container').removeClass('notransition');
                // And actually play the transition effect that will move the container from right to left
                $('#slider-container').css('margin-left', '-100%');
            }
            // No slideing effect
            else {
                leSwap();
            }
        },

        confirm: function(title, content, confirmCallback, cancelCallback) {
            // Default callbacks
            confirmCallback = typeof confirmCallback !== 'undefined' ? confirmCallback : function() {};
            cancelCallback = typeof cancelCallback !== 'undefined' ? cancelCallback : function() {};

            // Get modal element
            var box = $('#modal');

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
                    if ($(this).data('modal-action') == 'confirm') {
                        confirmCallback();
                    }
                    else {
                        cancelCallback();
                    }
                });

            // Show modal
            return box.modal('show');
        },

        selectAllOrNone: function () {
          // Remove active style from buttons
          $(".select_all-none input").click(function(){ $(this).toggleClass("active"); });
          // Select all checkbox in this panel
          $(".select_all").click(function(){
            $(this).parents(".panel").children(".list-group").find("input").prop("checked", true);
          });
          // Deselect all checkbox in this panel
          $(".select_none").click(function(){
            $(this).parents(".panel").children(".list-group").find("input").prop("checked", false);
          });
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

        groupHooks: function(hooks, raw_infos){
            var data = {};
            var rules = [
                {
                    id:'configuration',
                    isIn:function (hook) {
                        return hook.indexOf('conf_')==0
                    }
                }
            ];

            $.each(hooks, function(i, hook) {
                var group_id=hook;
                var hook_size=(raw_infos && raw_infos[hook] && raw_infos[hook].size)?raw_infos[hook].size:0;
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
                        description:data[group_id].description+', '+y18n.t('hook_'+hook),
                        size:data[group_id].size + hook_size
                    };
                }
                else {
                    data[group_id] = {
                        name:y18n.t('hook_'+group_id),
                        value:hook,
                        description:(group_id==hook)?y18n.t('hook_'+hook+'_desc'):y18n.t('hook_'+hook),
                        size:hook_size
                    };
                }
            });
            return data;
        },

        ungroupHooks: function(system_parts,apps) {
            var data = {};
            data['apps'] = apps || [];
            data['system'] = system_parts || [];

            if (data['system'].constructor !== Array) {
                data['system'] = [data['system']];
            }
            if (data['apps'].constructor !== Array) {
                data['apps'] = [data['apps']];
            }

            // Some hook value contains multiple hooks separated by commas
            var split_hooks = [];
            $.each(data['system'], function(i, hook) {
                split_hooks = split_hooks.concat(hook.split(','));
            });
            data['system'] = split_hooks;

            if (data['system'].length == 0) {
                delete data['system'];
	    }
            if (data['apps'].length == 0) {
                delete data['apps'];
	    }
            return data;
        },

        // Paste <pre>
        prePaste: function() {
            var pasteButtons = $('button[data-paste-content],a[data-paste-content]');
            pasteButtons.on('click', function(){
                // Get paste content element
                var preElement = $($(this).data('paste-content'));

                // Add pacman loader
                $('#main').append('<div class="loader loader-content"></div>');

                // Send to paste.yunohost.org
                $.ajax({
                    type: "POST",
                    url: 'https://paste.yunohost.org/documents',
                    data: preElement.text(),
                })
                .success(function(data, textStatus, jqXHR) {
                    window.open('https://paste.yunohost.org/' + data.key, '_blank');
                })
                .fail(function() {
                    c.flash('fail', y18n.t('paste_error'));
                })
                .always(function(){
                    // Remove pacman
                    $('div.loader').remove();
                });
            });
        },

        redirect_to: function(destination, options) {

            options = options !== undefined ? options : {};

            // If destination if the same as current url,
            // we don't want to display the slide animation
            // (or if the code explicitly state to disable slide animation)
            if ((c.path.split("#")[1] == destination.split("#")[1]) || (options.slide == false))
            {
                store.clear('slide');
            }

            c = this;
            // This is a copy-pasta of some of the redirect/refresh code of
            // sammy.js because for some reason calling the original
            // redirect/refresh function in some context does not work >.>
            // (e.g. if you're already on the page)
            c.trigger('redirect', {to: destination});
            c.app.last_location = c.path;
            c.app.setLocation(destination);
            c.app.trigger('location-changed');
        }
    });

})();
