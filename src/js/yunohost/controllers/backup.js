(function() {
    // Get application context
    var app = Sammy.apps['#main'];
    var store = app.store;

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
    app.get('#/backup', function (c) {
        var storages = [];
        var item = {
            id: 'local',
            name: y18n.t('local_archives'),
            uri: '/home/yunohost.backup/'
        };
        storages.push(item);

        c.view('backup/backup', {'storages':storages});
    });

    // Archive list
    app.get('#/backup/:storage', function (c) {
        c.api('GET', '/backup/archives?with_info', {}, function(data) {
            data.storage = {
                id: 'local',
                name: y18n.t('local_archives')
            };
            data.archives2 = [];
            $.each(data['archives'], function(name, info) {
                info.name = name;
                data.archives2.unshift(info)
            });
            data.archives = data.archives2;
            data.locale = y18n.locale
            c.view('backup/backup_list', data);
        });
    });

    // View to create a backup
    app.get('#/backup/:storage/create', function (c) {
        var data = [];
        data['storage'] = {
            id:c.params['storage'],
            name:y18n.t('local_archives')
        };
        c.api('GET', '/hooks/backup', {}, function(hooks) {
            data['hooks'] = groupHooks(hooks['hooks']);
            data['apps'] = {};
            c.api('GET', '/apps?with_backup', {}, function(apps_list) {
                data['apps'] = apps_list.apps;
                c.view('backup/backup_create', data, c.selectAllOrNone);
            });
        });
    });

    // Actually creating the backup
    app.post('#/backup/:storage', function (c) {
        var params = ungroupHooks(c.params['system_parts'],c.params['apps']);
        c.api('POST', '/backup', params, function() {
            c.redirect_to('#/backup/'+ c.params['storage']);
        });
    });

    // Get archive info
    app.get('#/backup/:storage/:archive', function (c) {
        c.api('GET', '/backup/archives/'+c.params['archive']+'?with_details', {}, function(data) {
            data.storage = {
                id: c.params['storage'],
                name: y18n.t('local_archives')
            };
            data.name = c.params['archive'];
            data.system_parts = groupHooks(Object.keys(data['system']),data['system']);
            data.items = (data['system']!={} || data['apps']!=[]);
            data.locale = y18n.locale;
            c.view('backup/backup_info', data, function() {

                c.selectAllOrNone();

                // Delete button
                $('button[data-action="delete"]').on('click', function() {
                    var storage = $(this).data('storage');
                    var archive = $(this).data('archive');
                    c.confirm(
                        y18n.t('backup'),
                        y18n.t('confirm_delete', [archive]),
                        function(){
                            c.api('DELETE', '/backup/archives/'+archive, {}, function(data) {
                                c.redirect_to('#/backup/'+ storage);
                            });
                        }
                    );
                });
            });
        });
    });

    // Restore a backup
    app.post('#/backup/:storage/:archive/restore', function (c) {
        c.confirm(
            y18n.t('backup'),
            y18n.t('confirm_restore', [c.params['archive']]),
            $.proxy(function(c){
                var params = ungroupHooks(c.params['system_parts'],c.params['apps']);
                params['force'] = '';
                c.api('POST', '/backup/restore/'+c.params['archive'], params, function(data) {
                    c.redirect_to('#/backup/'+ c.params['storage']+'/'+c.params['archive']);
                });
            }, this, c)
        );
    });

    function groupHooks(hooks, raw_infos) {
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
    };

    function ungroupHooks(system_parts, apps) {

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
    };


})();
