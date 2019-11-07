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
        c.api('GET', '/services', {}, function(data) {
            var data2 = {
                services: []
            };
            $.each(data, function(k, v) {
                v.name = k;
                if (v.last_state_change == 'unknown')
                {
                    v.last_state_change = 0;
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
        c.api('GET', '/services/'+ c.params['service'], {}, function(data) {
            data.name = c.params['service'];
            if (data.last_state_change == 'unknown')
            {
                data.last_state_change = 0;
            }
            c.view('service/service_info', data, function() {

                // Configure behavior for enable/disable and start/stop buttons
                $('button[data-action]').on('click', function() {

                    var service = $(this).data('service');
                    var action = $(this).data('action');

                    c.confirm("Service", y18n.t('confirm_service_' + action, [service]), function(){

                        var method = null,
                            endurl = service;

                        switch (action) {
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
                                c.flash('fail', y18n.t('unknown_action', [action]));
                                c.refresh();
                                return;
                        }

                        c.api(method, '/services/'+ endurl, {}, function() { c.refresh(); });
                    });
                });
            });
        });
    });

    // Service log
    app.get('#/services/:service/log', function (c) {
        var params = {
            number: 50
        };
        c.api('GET', '/services/'+ c.params['service'] +'/log', params, function(data) { // ?
            data2 = { 'logs': [], 'name': c.params['service'] };
            $.each(data, function(k, v) {
                data2.logs.push({filename: k, filecontent: v.join('\n')});
            });

            c.view('service/service_log', data2);
        });
    });

})();
