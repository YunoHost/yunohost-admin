(function() {
    // Get application context
    var app = Sammy.apps['#main'];
    var store = app.store;

    /**
     * Firewall
     *
     */

    // Firewall status
    app.get('#/tools/firewall', function (c) {
        c.api('GET', '/firewall?raw', {}, function(data) {
            var firewall = {
                ports: {},
                upnp: false
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

            c.view('tools/tools_firewall', firewall, function() {

                // Buttons in the 'ports' panel to open/close specific ports
                $("button[data-port]").on("click", function() {

                    var port = $(this).data("port");
                    var action = $(this).data("action");
                    var protocol = $(this).data("protocol");
                    var connection = $(this).data("connection");
                    c.confirm(
                        y18n.t('firewall'),
                        // confirm_firewall_open and confirm_firewall_close
                        y18n.t('confirm_firewall_' + action, [ port, y18n.t(protocol), y18n.t(connection)]),
                        function(){ c.togglePort(port, protocol, connection, action); }
                    );
                });

                // Buttons to enable / disable UPnP
                $("button[data-upnp]").on("click", function() {
                    var action = $(this).data("upnp");
                    c.confirm(
                        y18n.t('firewall'),
                        // confirm_upnp_enable and confirm_upnp_disable
                        y18n.t('confirm_upnp_' + action),
                        function(){ c.api('GET', '/firewall/upnp', {action: action}, function() { c.refresh() }); }
                    );
               });
            });
        });
    });

    // Update port status from form
    app.post('#/tools/firewall/port', function (c) {
        c.confirm(
            y18n.t('firewall'),
            y18n.t('confirm_firewall_' + c.params['action'].toLowerCase(), [ c.params['port'], y18n.t(c.params['protocol']), y18n.t(c.params['connection']) ]),
            function(){
                c.togglePort(
                    c.params['port'],
                    c.params['protocol'],
                    c.params['connection'],
                    c.params['action']
                );
            }
        );
    });

    // Toggle port status helper (available in every controller)
    app.helper('togglePort', function(port, protocol, connection, action) {
        var method = null,
            endurl = [],
            c = this
        ;

        if (port != parseInt(port) || port < 0 || port > 65535) {
            c.flash('fail', y18n.t('unknown_argument', [port]));
            c.refresh();
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
                c.refresh();
        }

        // port:
        // protocol:
        //    - UDP
        //    - TCP
        //    - Both
        // --ipv4-only:
        // --ipv6-only:
        // --no-upnp:
        var params = {
            port : port,
            protocol : protocol
        };

        c.api(method, '/firewall/port?'+endurl, params, function() { c.refresh() });


        return;
    });


})();
