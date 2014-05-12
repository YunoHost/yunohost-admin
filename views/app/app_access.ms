<div class="pull-left">
    <a href="#/apps/{{settings.id}}" class="btn btn-default slide back">
        <span class="fa-chevron-left"></span> {{settings.label}}
    </a>
</div>
<div class="pull-right">
</div>
<div class="clearfix"></div>
<h1 class="view-title">{{t 'app_access_title' settings.label}}</h1>

<div class="br"></div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-users"></span> {{t 'allowed_users'}}</h2>
    </div>
    {{#if settings.allowed_users}}
    <div class="list-group">
        {{#each settings.allowed_users}}
        <div class="list-group-item">
            <a href="#/apps/{{../settings.id}}/access/remove/{{username}}" class="btn btn-danger slide back pull-right">
                <span class="fa-trash-o"></span> {{t 'remove_access'}}
            </a>
            <h3 class="list-group-item-heading">{{fullname}} ({{mail}})</h3>
            <a href="#/users/{{username}}">{{t 'view_user_profile' username}}</a>
        </div>
        {{/each}}
    </div>
    {{else}}
    <div class="panel-body">
        {{#if settings.allow_everyone}}
        <p class="text-success">{{t 'everyone_has_access'}}</p>
        {{else}}
        <p class="text-warning">{{t 'no_allowed_users'}}</p>
        {{/if}}
    </div>
    {{/if}}
    <div class="panel-footer">
        {{#if users}}
        <form method="POST" action="#/apps/{{settings.id}}/access/add" class="row">
            <input type="hidden" name="app" value="{{settings.id}}">
            <div class="col-xs-9 col-sm-6">
                <select name="user" required class="form-control">
                    <option value="" default disabled selected>{{t 'select_user'}}</option>
                    {{#users}}<option value="{{value}}">{{label}}</option>{{/users}}
                </select>
            </div>
            <div class="col-xs-3 col-sm-6">
                <input type="submit" class="btn btn-success slide back" value="{{t 'add'}}">
            </div>
        </form>
        {{else}}
            <p class="text-warning">{{t 'no_user_to_add'}}</p>
        {{/if}}
    </div>
</div>

<div class="panel-group" id="accordion">
<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title">
            <a data-toggle="collapse" data-parent="#accordion" href="#collapseOne">
                <span class="fa-fw fa-wrench"></span> {{t 'operations'}}
            </a>
        </h2>
    </div>
    <div id="collapseOne" class="panel-collapse collapse">
    <div class="panel-body">
        {{#if users}}
        <div class="container">
            <p>{{t 'app_access_addall_desc' settings.label}}</p>
            <a href="#/apps/{{settings.id}}/access/add" class="btn btn-success slide back">
                <span class="fa-plus"></span> {{t 'app_access_addall_btn'}}
            </a>
        </div>
        <hr>
        {{/if}}
        {{#if settings.allowed_users}}
        <div class="container">
            <p>{{t 'app_access_removeall_desc' settings.label}}</p>
            <a href="#/apps/{{../settings.id}}/access/remove" class="btn btn-danger slide back">
                <span class="fa-trash-o"></span> {{t 'app_access_removeall_btn'}}
            </a>
        </div>
        <hr>
        {{/if}}
        {{#unless settings.allow_everyone}}
        <div class="container">
            <p>{{t 'app_access_clearall_desc' settings.label}}</p>
            <a href="#/apps/{{settings.id}}/access/clear" class="btn btn-primary slide back">
                <span class="fa-unlock-alt"></span> {{t 'app_access_clearall_btn'}}
            </a>
        </div>
        {{/unless}}
    </div>
    </div>
</div>
</div>
