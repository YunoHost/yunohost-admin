(function() {
    // Get application context
    var app = Sammy.apps['#main'];
    var store = app.store;

    var PASSWORD_MIN_LENGTH = 4;

    /**
     * Users
     *
     */

    // List existing users
    app.get('#/users', function (c) {
        c.api('/users', function(data) { // http://api.yunohost.org/#!/user/user_list_get_3
            c.view('user/user_list', data);
        });
    });

    // Create user form
    app.get('#/users/create', function (c) {
        c.api('/domains', function(data) { // http://api.yunohost.org/#!/domain/domain_list_get_2

            // Password min length
            data.password_min_length = PASSWORD_MIN_LENGTH;
            c.view('user/user_create', data, function(){
                var usernameField = $('#username');
                usernameField.on('blur', function(){
                    var emailField = $('#email');
                    if (emailField.val() == '') {
                        emailField.val(usernameField.val());
                    }
                });
            });
        });
    });

    // Create user (POST)
    app.post('#/users/create', function (c) {
        if (c.params['password'] == c.params['confirmation']) {
            if (c.params['password'].length < PASSWORD_MIN_LENGTH) {
                c.flash('fail', y18n.t('password_too_short'));
                store.clear('slide');
            }
            else {
                // Force unit or disable quota
                if (c.params['mailbox_quota']) {
                    c.params['mailbox_quota'] += "M";
                }
                else {c.params['mailbox_quota'] = 0;}

                // Compute email field
                c.params['mail'] = c.params['email'] + c.params['domain'];

                c.api('/users', function(data) { // http://api.yunohost.org/#!/user/user_create_post_2
                    c.redirect('#/users');
                }, 'POST', c.params.toHash());
            }
        } else {
            c.flash('fail', y18n.t('passwords_dont_match'));
            store.clear('slide');
            //c.redirect('#/users/create');
        }
    });

    // Show user information
    app.get('#/users/:user', function (c) {
        c.api('/users/'+ c.params['user'], function(data) { // http://api.yunohost.org/#!/user/user_info_get_0
            c.view('user/user_info', data);
        });
    });

    // Edit user form
    app.get('#/users/:user/edit', function (c) {
        c.api('/users/'+ c.params['user'], function(data) { // http://api.yunohost.org/#!/user/user_info_get_0
            c.api('/domains', function(dataDomains) { // http://api.yunohost.org/#!/domain/domain_list_get_2

                // Password min length
                data.password_min_length = PASSWORD_MIN_LENGTH;

                // User email use a fake splitted field
                var email = data.mail.split('@');
                data.email = {
                    username : email[0],
                    domain : email[1]
                };

                // Return quota with M unit
                if (data['mailbox-quota'].limit) {
                    var unit = data['mailbox-quota'].limit.slice(-1);
                    var value = data['mailbox-quota'].limit.substr(0, data['mailbox-quota'].limit.length -1);
                    if (unit == 'b') {
                        data.quota = Math.ceil(value / (1024 * 1024));
                    }
                    else if (unit == 'k') {
                        data.quota = Math.ceil(value / 1024);
                    }
                    else if (unit == 'M') {
                        data.quota = value;
                    }
                    else if (unit == 'G') {
                        data.quota = Math.ceil(value * 1024);
                    }
                    else if (unit == 'T') {
                        data.quota = Math.ceil(value * 1024 * 1024);
                    }
                }
                else {data.quota = 0;}

                // Domains
                data.domains = [];
                $.each(dataDomains.domains, function(key, value) {
                    data.domains.push({
                        domain: value,
                        selected: (value == data.email.domain) ? true : false
                    });
                });

                c.view('user/user_edit', data);
            });
        });
    });

    // Update user information
    app.put('#/users/:user', function (c) {
        // Get full user object
        c.api('/users/'+ c.params['user'], function(user) {
            // Force unit or disable quota
            if (c.params['mailbox_quota']) {
                c.params['mailbox_quota'] += "M";
            }
            else {c.params['mailbox_quota'] = 0;}

            // concat email/domain pseudo field
            if (c.params['mail'] !== c.params['email'] + c.params['domain']) {
                c.params['mail'] = c.params['email'] + c.params['domain'];
            }
            else {
                c.params['mail'] = '';
            }
            // Clear temporary inputs
            c.params['email'] = c.params['domain'] = '';


            // force array type for mail aliases and redirections
            if (typeof c.params['mailalias'] == 'string') {c.params['mailalias'] = [c.params['mailalias']];}
            if (typeof c.params['mailforward'] == 'string') {c.params['mailforward'] = [c.params['mailforward']];}

            // Check for added/removed aliases and redirections
            c.params['add_mailalias'] = c.arrayDiff(c.params['mailalias'], user['mail-aliases']);
            c.params['remove_mailalias'] = c.arrayDiff(user['mail-aliases'], c.params['mailalias']);
            c.params['add_mailforward'] = c.arrayDiff(c.params['mailforward'], user['mail-forward']);
            c.params['remove_mailforward'] = c.arrayDiff(user['mail-forward'], c.params['mailforward']);

            // Clear temporary inputs
            c.params['mailalias'] = c.params['mailforward'] = '';

            // Remove empty inputs
            var params = {};
            $.each(c.params.toHash(), function(key, value) {
                if (value.length > 0 && key !== 'user') { params[key] = value; }
            });

            if ($.isEmptyObject(params)) {
                c.flash('fail', y18n.t('error_modify_something'));
                store.clear('slide');
                c.redirect('#/users/'+ c.params['user'] + '/edit');
            } else {
                if (params['password']) {
                    if (params['password'] == params['confirmation']) {
                        if (params['password'].length < PASSWORD_MIN_LENGTH) {
                            c.flash('fail', y18n.t('password_too_short'));
                            store.clear('slide');
                            c.redirect('#/users/'+ c.params['user'] + '/edit');
                        }
                        else {
                            params['change_password'] = params['password'];
                            c.api('/users/'+ c.params['user'], function(data) { // http://api.yunohost.org/#!/user/user_update_put_1
                                c.redirect('#/users/'+ c.params['user']);
                            }, 'PUT', params);
                        }
                    } else {
                        c.flash('fail', y18n.t('passwords_dont_match'));
                        store.clear('slide');
                        c.redirect('#/users/'+ c.params['user'] + '/edit');
                    }
                }
                else {
                    c.api('/users/'+ c.params['user'], function(data) { // http://api.yunohost.org/#!/user/user_update_put_1
                        c.redirect('#/users/'+ c.params['user']);
                    }, 'PUT', params);
                }
            }
        }, 'GET');
    });

    // Remove existing user
    app.get('#/users/:user/delete', function (c) {

        var params = {};

        // make confirm content
        var purgeCheckbox = '<div><input type="checkbox" id="purge-user-data" name="purge-user-data"> <label for="purge-user-data">'+ y18n.t('purge_user_data_checkbox', [c.params['user']]) +'</label></div>';
        var purgeAlertMessage = '<div class="danger" style="display: none">⚠ '+ y18n.t('purge_user_data_warning') +'</div>';
        var confirmModalContent = $('<div>'+ y18n.t('confirm_delete', [c.params['user']]) +'<br><br>'+ purgeCheckbox +'<br>'+ purgeAlertMessage +'</div>');

        // display confirm modal
        c.confirm(
            y18n.t('users'),
            confirmModalContent,
            function(){
                c.api('/users/'+ c.params['user'], function(data) { // http://api.yunohost.org/#!/user/user_delete_delete_4
                    c.redirect('#/users');
                }, 'DELETE', params);
            },
            function(){
                store.clear('slide');
                c.redirect('#/users/'+ c.params['user']);
            }
        );

        // toggle purge warning and parameter
        confirmModalContent.find("input").click(function(){

          if (confirmModalContent.find("input").is(':checked')) {
            params.purge = "";
            confirmModalContent.find(".warning").show();
          }
          else {
            delete params.purge;
            confirmModalContent.find(".warning").hide();
          };

        });

    });

})();
