<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/apps">{{t 'applications'}}</a>
    <a href="#/apps/{{settings.id}}">{{settings.label}}</a>
</div>


<div class="separator"></div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-info-circle"></span> {{t 'infos'}}</h2>
    </div>
    <div class="panel-body">
        <dl class="dl-horizontal">
            <dt>{{t 'id'}}</dt>
            <dd>{{settings.id}}</dd>
            <dt>{{t 'label'}}</dt>
            <dd>{{settings.label}}</dd>
            <dt>{{t 'description'}}</dt>
            <dd>{{description}}</dd>
            <dt>{{t 'version'}}</dt>
            <dd>{{version}}</dd>
            <dt>{{t 'multi_instance'}}</dt>
            <dd>{{manifest.multi_instance}}</dd>
            <dt>{{t 'install_time'}}</dt>
            <dd>{{formatTime install_time day="numeric" month="long" year="numeric" hour="numeric" minute="numeric"}}</dd>
            {{#if settings.domain}}
                <dt>{{t 'url'}}</dt>
                <dd><a href="https://{{settings.domain}}{{settings.path}}" target="_blank">https://{{settings.domain}}{{settings.path}}</a></dd>
            {{/if}}
        </dl>
    </div>
</div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title">
            <span class="fa-fw fa-wrench"></span> {{t 'operations'}}
        </h2>
    </div>
    <div class="panel-body">
        <div class="container">
            <p>{{t 'app_info_changelabel_desc' settings.label}}</p>
            <a role="button" href="#/apps/{{settings.id}}/changelabel" class="btn btn-info slide">
                <span class="fa-tag"></span> {{t 'app_change_label'}}
            </a>
        </div>
        <hr>
        <div class="container">
            <p>{{t 'app_info_access_desc'}} {{#each permissions}} {{ucwords .}}{{#unless @last}}, {{/unless}} {{ else }} {{t 'nobody'}} {{/each}}
            </p>
            <a role="button" href="#/groups" class="btn btn-info slide">
                <span class="fa-key-modern"></span> {{t 'groups_and_permissions_manage'}}
            </a>
        </div>
        <hr>
        <div class="container">
            <p>{{t 'app_info_default_desc' settings.domain}}</p>
            <button class="btn btn-success" data-action="set-as-default" data-app="{{settings.id}}">
                <span class="fa-star"></span> {{t 'app_make_default'}}
            </button>
        </div>
        <hr>
        <div class="container">
            <p>{{t 'app_info_changeurl_desc' settings.domain}}</p>
            {{#if change_url}}
                <a href="#/apps/{{settings.id}}/changeurl" role="button" class="btn btn-info slide">
                    <span class="fa-exchange"></span> {{t 'app_change_url'}}
                </a>
            {{else}}
                {{#tooltip (t 'app_info_change_url_disabled_tooltip') }}
                    <a href="#/apps/{{settings.id}}/changeurl" class="btn btn-info slide disabled">
                        <span class="fa-exchange"></span> {{t 'app_change_url'}}
                    </a>
                {{/tooltip}}
            {{/if}}
        </div>
        <hr>
        <div class="container">
            <p>{{t 'app_info_uninstall_desc'}}</p>
            <button class="btn btn-danger slide back" data-action="uninstall" data-app="{{settings.id}}">
                <span class="fa-trash-o"></span> {{t 'uninstall'}}
            </button>
        </div>
    </div>
</div>
{{load_tooltips}}
