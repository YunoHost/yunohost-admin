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
        c.api('/firewall?raw', function(data) {
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

            c.view('tools/tools_firewall', firewall);
        });
    });

    // Enable/Disable UPnP
    app.get('#/tools/firewall/upnp/:action', function (c) {
        c.confirm(
            y18n.t('firewall'),
            // confirm_upnp_enable and confirm_upnp_disable
            y18n.t('confirm_upnp_' + c.params['action'].toLowerCase()),
            function(){
                var params = {
                    action : c.params['action']
                };
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
    app.helper('togglePort', function(port, protocol, connection, action) {
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
                port : port,
                protocol : protocol
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
    app.get('#/tools/firewall/port/:port/:protocol/:connection/:action', function (c) {
        c.confirm(
            y18n.t('firewall'),
            // confirm_firewall_open and confirm_firewall_close
            y18n.t( 'confirm_firewall_' + c.params['action'].toLowerCase(), [ c.params['port'], y18n.t(c.params['protocol']), y18n.t(c.params['connection'])]),
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
            },
            function(){
                store.clear('slide');
                c.redirect('#/tools/firewall');
            }
        );
    });

})();