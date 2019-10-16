<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/update">{{t 'system_update'}}</a>
</div>

<div class="separator"></div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-server"></span> {{t 'system'}}</h2>
    </div>
    {{#if system}}
    <div class="list-group">
        {{#system}}
        <div class="list-group-item">
            <h3 class="list-group-item-heading">
                {{name}} <small>({{t 'from_to' current_version new_version}}) </small>
            </h3>
        </div>
        {{/system}}
    </div>
    <div class="panel-footer">
        <button class="btn btn-success" data-upgrade="system">{{t 'system_upgrade_all_packages_btn'}}</button>
    </div>
    {{else}}
    <div class="panel-body">
        {{t 'system_packages_nothing'}}
    </div>
    {{/if}}
</div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-cubes"></span> {{t 'applications'}}</h2>
    </div>
    {{#if apps}}
    <div class="list-group">
        {{#apps}}
        <div class="list-group-item clearfix">
            <button class="btn btn-success pull-right" data-upgrade="{{id}}">{{t 'system_upgrade_btn'}}</button>
            <h3 class="list-group-item-heading">{{label}} <small>{{id}}</small></h3>
            <p class="list-group-item-text">{{t 'from_to' current_version new_version}}</p>
        </div>
        {{/apps}}
    </div>
    <div class="panel-footer">
        <button class="btn btn-success" data-upgrade="apps">{{t 'system_upgrade_all_applications_btn'}}</button>
    </div>
    {{else}}
    <div class="panel-body">
        {{t 'system_apps_nothing'}}
    </div>
    {{/if}}
</div>
