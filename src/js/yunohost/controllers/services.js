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
        c.api('GET', '/services/'+ c.params['service'] +'/log', {number: 50}, function(data_log) {

            data.name = c.params['service'];
            if (data.last_state_change == 'unknown')
            {
                data.last_state_change = 0;
            }

            data.logs = [];
            $.each(data_log, function(k, v) {
                data.logs.push({filename: k, filecontent: v.join('\n')});
            });

            // Sort logs by filename, put the journalctl/systemd log on top
            data.logs.sort(function(a,b) { return a.filename === "journalctl" ? -1 : b.filename === "journalctl" ? 1 : a.filename < b.filename ? -1 : a.filename > b.filename ? 1 : 0; });

            c.view('service/service_info', data, function() {

                // Configure behavior for enable/disable and start/stop buttons
                $('button[data-action="start"], button[data-action="stop"]').on('click', function() {

                    var service = $(this).data('service');
                    var action = $(this).data('action');

                    c.confirm("Service", y18n.t('confirm_service_' + action, [service]), function(){

                        var method = null,
                            endurl = service;

                        method = action === "start" ? 'PUT' : 'DELETE';
                        c.api(method, '/services/'+ endurl, {}, function() { c.refresh(); });
                    });
                });

                // Configure behavior for enable/disable and start/stop buttons
                $('button[data-action="share"]').on('click', function() {

                    c.showLoader();

                    // Send to paste.yunohost.org
                    $.ajax({
                        type: "POST",
                        url: 'https://paste.yunohost.org/documents',
                        data: $("#logs").text(),
                    })
                    .success(function(data, textStatus, jqXHR) {
                        window.open('https://paste.yunohost.org/' + data.key, '_blank');
                    })
                    .fail(function() {
                        c.flash('fail', y18n.t('paste_error'));
                    })
                    .always(function(){
                        c.hideLoader();
                    });
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
