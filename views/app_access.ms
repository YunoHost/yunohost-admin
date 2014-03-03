<div class="pull-left">
    <a href="#/apps/{{settings.id}}" class="btn btn-default slide back"><span class="glyphicon glyphicon-chevron-left"></span> {{settings.label}}</a>
</div>
<div class="pull-right">
</div>
<div class="clearfix"></div>
<div class="view-title">{{settings.label}} access</div>

<div class="br"></div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title">Allowed users</h2>
    </div>
    {{#if settings.allowed_users}}
    <div class="list-group">
        {{#each settings.allowed_users}}
        <div class="list-group-item">
            <a href="#/apps/{{../settings.id}}/access/remove/{{username}}" class="btn btn-danger slide back pull-right">
                <span class="glyphicon glyphicon-trash"></span> Remove access
            </a>
            <h3 class="list-group-item-heading">{{fullname}} ({{mail}})</h3>
            <a href="#/users/{{username}}">View {{username}}'s profile</a>
        </div>
        {{/each}}
    </div>
    {{else}}
    <div class="panel-body">
        {{#if settings.allow_everyone}}
        <p class="text-success">Everyone has access.</p>
        {{else}}
        <p class="text-warning">No allowed users.</p>
        {{/if}}
    </div>
    {{/if}}
    <div class="panel-footer">
        {{#if users}}
        <form method="POST" action="#/apps/{{settings.id}}/access/add" class="row">
            <input type="hidden" name="app" value="{{settings.id}}">
            <div class="col-xs-9 col-sm-6">
                <select name="user" required class="form-control">
                    <option value="" default disabled selected>Select user</option>
                    {{#users}}<option value="{{value}}">{{label}}</option>{{/users}}
                </select>
            </div>
            <div class="col-xs-3 col-sm-6">
                <input type="submit" class="btn btn-success slide back" value="Add">
            </div>
        </form>
        {{else}}
            <p class="text-warning">No more users to add.</p>
        {{/if}}
    </div>
</div>

<div class="panel-group" id="accordion">
<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title">
            <a data-toggle="collapse" data-parent="#accordion" href="#collapseOne">
                Bulk operations
            </a>
        </h2>
    </div>
    <div id="collapseOne" class="panel-collapse collapse">
    <div class="panel-body">
        {{#if users}}
        <div class="container">
            <p class="">
                All existing users will have access to {{settings.label}}.
            </p>
            <a href="#/apps/{{settings.id}}/access/add" class="btn btn-success slide back">
                <span class="glyphicon glyphicon-plus"></span> Add access to all
            </a>
        </div>
        <hr>
        {{/if}}
        {{#if settings.allowed_users}}
        <div class="container">
            <p class="">
                No users will have access to {{settings.label}}.
            </p>
            <a href="#/apps/{{../settings.id}}/access/remove" class="btn btn-danger slide back">
                <span class="glyphicon glyphicon-trash"></span> Remove all access
            </a>
        </div>
        <hr>
        {{/if}}
        {{#unless settings.allow_everyone}}
        <div class="container">
            <p class="">
                Every user will have access to {{settings.label}}.
            </p>
            <a href="#/apps/{{settings.id}}/access/clear" class="btn btn-primary slide back">
                <span class="glyphicon glyphicon-trash"></span> Clear all access
            </a>
        </div>
        {{/unless}}
    </div>
    </div>
</div>
</div>
