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

    // Storage list
    app.get('#/storages/create', function (c) {
        c.view('backup/storage_create', {});
    });

    // Create a storage
    app.post('#/storages', function (c) {
        c.redirect_to('#/storages');
    });

    // Create a backup
    app.get('#/backup/:storage/create', function (c) {
        var data = [];
        data['storage'] = {
            id:c.params['storage'],
            name:y18n.t('local_archives')
        };
        c.api('GET', '/hooks/backup', {}, function(hooks) {
            data['hooks'] = c.groupHooks(hooks['hooks']);
            data['apps'] = {};
            c.api('GET', '/apps?with_backup', {}, function(apps_list) {
                data['apps'] = apps_list.apps;
                c.view('backup/backup_create', data, c.selectAllOrNone);
            });
        });
    });


    app.post('#/backup/:storage', function (c) {
        var params = c.ungroupHooks(c.params['system_parts'],c.params['apps']);
        c.api('POST', '/backup', params, function() {
            c.redirect_to('#/backup/'+ c.params['storage']);
        });
    });

    // Restore a backup
    app.post('#/backup/:storage/:archive/restore', function (c) {
        c.confirm(
            y18n.t('backup'),
            y18n.t('confirm_restore', [c.params['archive']]),
            $.proxy(function(c){
                var params = c.ungroupHooks(c.params['system_parts'],c.params['apps']);
                params['force'] = '';
                c.api('POST', '/backup/restore/'+c.params['archive'], params, function(data) {
                    c.redirect_to('#/backup/'+ c.params['storage']+'/'+c.params['archive']);
                });
            }, this, c)
        );
    });

    // Delete a backup
    app.get('#/backup/:storage/:archive/delete', function (c) {
        c.confirm(
            y18n.t('backup'),
            y18n.t('confirm_delete', [c.params['archive']]),
            function(){
                c.api('DELETE', '/backup/archives/'+c.params['archive'], {}, function(data) {
                    c.redirect_to('#/backup/'+ c.params['storage']);
                });
            }
        );
    });

    // Download a backup
    app.get('#/backup/:storage/:archive/download', function (c) {
        c.api('GET', '/backup/'+c.params['archive']+'/download', {}, function(data) {
            c.redirect_to('#/backup/'+ c.params['storage']+'/'+c.params['archive'], {slide: false});
        });
    });

    // Copy a backup
    app.get('#/backup/:storage/:archive/copy', function (c) {
        c.redirect_to('#/backup/'+ c.params['storage']+'/'+c.params['archive'], {slide: false});
    });

    // Upload a backup
    app.get('#/backup/:storage/:archive/upload', function (c) {
        c.redirect_to('#/backup/'+ c.params['storage']+'/'+c.params['archive'], {slide: false});
    });

    // Get archive info
    app.get('#/backup/:storage/:archive', function (c) {
        c.api('GET', '/backup/archives/'+c.params['archive']+'?with_details', {}, function(data) {
            data.storage = {
                id: c.params['storage'],
                name: y18n.t('local_archives')
            };
            data.other_storages = [];
            data.name = c.params['archive'];
            data.system_parts = c.groupHooks(Object.keys(data['system']),data['system']);
            data.items = (data['system']!={} || data['apps']!=[]);
            data.locale = y18n.locale
            c.view('backup/backup_info', data, c.selectAllOrNone);
        });
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

})();
