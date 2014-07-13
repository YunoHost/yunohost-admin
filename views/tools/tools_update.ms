<div class="pull-left">
    <a href="#/tools" class="btn btn-default slide back">
       <span class="fa-chevron-left"></span> {{t 'tools'}}
    </a>
</div>
<div class="clearfix"></div>
<h1 class="view-title">{{t 'system_update'}}</h1>
<div class="br"></div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"> {{t 'system_packages'}}</h2>
    </div>
    {{#if packages}}
    <div class="list-group">
        {{#packages}}
        <div class="list-group-item">
            {{#if delayed}}
            <span class="text-warning pull-right">
                <span class="fa-warning"></span> {{t 'system_delayed_upgrade'}}
            </span>
            {{/if}}
            <h3 class="list-group-item-heading">
                <a data-toggle="collapse" href="#{{name}}-changelog">{{name}}</a> <small>{{fullname}}</small>
            </h3>
            <p id="{{name}}-changelog" class="list-group-item-text collapse">{{{changelog}}}</p>
        </div>
        {{/packages}}
    </div>
    <div class="panel-footer">
        <a href="#/tools/upgrade/packages" class="btn btn-success">{{t 'system_upgrade_btn'}}</a>
    </div>
    {{else}}
    <div class="panel-body">
        {{t 'system_packages_nothing'}}
    </div>
    {{/if}}
</div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"> {{t 'system_apps'}}</h2>
    </div>
    {{#if apps}}
    <div class="list-group">
        {{#apps}}
        <div class="list-group-item">
            <h3 class="list-group-item-heading">{{label}} <small>{{id}}</small></h3>
        </div>
        {{/apps}}
    </div>
    <div class="panel-footer">
        <a href="#/tools/upgrade/apps" class="btn btn-success">{{t 'system_upgrade_btn'}}</a>
    </div>
    {{else}}
    <div class="panel-body">
        {{t 'system_apps_nothing'}}
    </div>
    {{/if}}
</div>

