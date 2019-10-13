(function() {
    // Get application context
    var app = Sammy.apps['#main'];
    var store = app.store;

    /**
     * Monitor
     *
     */

    // Server monitoring
    app.get('#/tools/monitor', function (c) {
        var monitorData = {};

        // Why this method ?
        c.api('GET', '/services/glances', {}, function(data) {
            monitorData.status = true;

            if (data.status == 'running') {
                c.api('GET', '/monitor/system', {}, function(data) {
                    monitorData.system = data;

                    c.api('GET', '/monitor/disk', {}, function(data) {
                        monitorData.disk = data;

                        c.api('GET', '/monitor/network', {}, function(data) {
                            monitorData.network = data;

                            // Remove useless interface
                            delete monitorData.network.usage.lo;

                            // Get YunoHost versions too
                            c.api('GET', '/diagnosis', {}, function(diagnosis) {
                                monitorData.versions = diagnosis.packages;
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
        });
    });

})();
