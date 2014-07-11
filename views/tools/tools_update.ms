<div class="container pull-left">
    <div class="row">
        <div id="bc1" class="btn-group btn-breadcrumb">
            <a href="#/" class="btn btn-default"><i class="fa fa-home"></i></a>
            <a href="#/tools" class="btn btn-default"><div>{{t 'tools'}}</div></a>
            <a href="#/tools/update" class="btn btn-default"><div>{{t 'system_update'}}</div></a>
        </div>
    </div>
</div>
<div class="clearfix"></div>
<div class="br"></div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"> {{t 'system_packages'}}</h2>
    </div>
    <div class="panel-body list-group">
    {{#if packages}}
        {{#packages}}
        <div class="list-group-item">
            {{#if delayed}}
            <span class="text-warning pull-right">
                <span class="fa-warning"></span> {{t 'system_delayed_upgrade'}}
            </span>
            {{/if}}
            <h3 class="list-group-item-heading">{{name}} <small>{{fullname}}</small></h3>
            <p class="list-group-item-text">{{{changelog}}}</p>
        </div>
        {{/packages}}

        <div class="br"></div>
        <a href="#/tools/upgrade/packages" class="btn btn-success">{{t 'system_upgrade_btn'}}</a>
    {{else}}
    {{t 'system_packages_nothing'}}
    {{/if}}
    </div>
</div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"> {{t 'system_apps'}}</h2>
    </div>
    <div class="panel-body list-group">
    {{#if apps}}
        {{#apps}}
        <div class="list-group-item">
            <h3 class="list-group-item-heading">{{label}} <small>{{id}}</small></h3>
        </div>
        {{/apps}}

        <div class="br"></div>
        <a href="#/tools/upgrade/apps" class="btn btn-success">{{t 'system_upgrade_btn'}}</a>
    {{else}}
    {{t 'system_apps_nothing'}}
    {{/if}}
    </div>
</div>
