(function() {
    // Get application context
    var app = Sammy.apps['#main'];
    var store = app.store;

    /**
     * Services
     *
     */

    // All services status
    app.get('#/services', function (c) {
        c.api('/services', function(data) { // ?
            var data2 = {
                services: []
            };
            $.each(data, function(k, v) {
                v.name = k;
                // Handlebars want booleans
                v.is_loaded = (v.loaded=='enabled') ? true : false;
                v.is_running = (v.active=='active') ? true : false;
                // Translate status and loaded state
                v.status = y18n.t(v.status);
                v.loaded = y18n.t(v.loaded);
                if (v.active_at == 'unknown')
                {
                    delete v.active_at;
                }
                data2.services.push(v);
            });

            data2.services.sort(function (a, b) {
                if (a.name > b.name) {
                    return 1;
                }
                else if (a.name < b.name) {
                    return -1;
                }
                return 0;
            });

            c.view('service/service_list', data2);
        });
    });

    // Status & actions for a service
    app.get('#/services/:service', function (c) {
        c.api('/services/'+ c.params['service'], function(data) { // ?
            var data2 = {
                service: data
            };
            data2.service.name = c.params['service'];
            // Handlebars want booleans
            data2.service.is_loaded = (data.loaded=='enabled') ? true : false;
            data2.service.is_running = (data.active=='active') ? true : false;
            // Translate status and loaded state
            data2.service.active = y18n.t(data.active);
            data2.service.loaded = y18n.t(data.loaded);
            if (data.active_at != 'unknown')
            {
                data2.service.active_at = data.active_at;
            }
            else
            {
                data2.service.active_at = 0;
            }
            store.clear('slide');
            c.view('service/service_info', data2);
        }, 'GET');
    });

    // Service log
    app.get('#/services/:service/log', function (c) {
        var params = {
            number: 50
        };
        c.api('/services/'+ c.params['service'] +'/log', function(data) { // ?
            data2 = { 'logs': [], 'name': c.params['service'] };
            $.each(data, function(k, v) {
                data2.logs.push({filename: k, filecontent: v.join('\n')});
            });

            c.view('service/service_log', data2);
        }, 'GET', params);
    });

    // Enable/Disable & Start/Stop service
    app.get('#/services/:service/:action', function (c) {
        c.confirm(
            "Service",
            // confirm_service_start, confirm_service_stop, confirm_service_enable and confirm_service_disable
            y18n.t('confirm_service_' + c.params['action'].toLowerCase(), [c.params['service']]),
            function(){
                var method = null,
                    endurl = c.params['service'];

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

})();
