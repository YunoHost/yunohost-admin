<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/services">{{t 'services'}}</a>
    <a href="#/services/{{service.name}}">{{name}}</a>
</div>

<div class="separator"></div>


<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title" style="display: inline-block; margin-right: 10px;"><span class="fa-fw fa-info-circle"></span> {{name}}</h2>
        {{#if (or (eq status "running") (eq status "active"))}}
            <button class="btn btn-sm btn-danger pull-right" data-service="{{name}}" data-action="stop">
                <span class="fa-fw fa-warning"></span> {{t 'stop'}}
            </button>
            <button class="btn btn-sm btn-warning pull-right" data-service="{{name}}" data-action="restart">
                <span class="fa-fw fa-refresh"></span> {{t 'restart'}}
            </button>
        {{else}}
            <button class="btn btn-sm btn-success pull-right" data-service="{{name}}" data-action="start">
                <span class="fa-fw fa-play"></span> {{t 'start'}}
            </button>
        {{/if}}
    </div>
    <div class="panel-body">
    <dl class="dl-horizontal">

        <dt>{{t 'description'}}</dt>
        <dd>{{description}}</dd>

        <dt>{{t 'status'}}</dt>
        <dd>
        {{#if (or (eq status "running") (eq status "active"))}}
        <span class="text-success">
            <span class="fa-fw fa-check-circle"></span>
        {{else}}
        <span class="text-danger">
            <span class="fa-fw fa-times"></span>
        {{/if}}
            {{t status}} </span> {{t 'since'}} {{formatRelative last_state_change day="numeric" month="long" year="numeric" hour="numeric" minute="numeric" }}
        </dd>

        <dt>{{t 'service_start_on_boot'}}</dt>
        {{#if (eq start_on_boot "enabled")}}
        <dd class="text-success">
        {{else}}
        <dd class="text-danger">
        {{/if}}
            {{t start_on_boot}}
        </dd>

        <dt>{{t 'configuration'}}</dt>
        {{#if (eq configuration "valid")}}
        <dd class="text-success">
        {{else if (eq configuration "broken")}}
        <dd class="text-danger">
        {{else}}
        <dd>
        {{/if}}
            {{t configuration}}
        </dd>
    </dl>
    </div>
</div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title" style="display: inline-block; margin-right: 10px;"><span class="fa-fw fa-book"></span> {{t 'logs'}}</h2>
        <button class="btn btn-sm btn-success pull-right" data-action="share"><span class="fa-cloud-upload"></span> {{t 'logs_share_with_yunopaste'}}</button>
    </div>
    <div id="logs" class="panel-body">
    {{#logs}}
        <h2>{{filename}}</h2>
        <pre class="service-log">{{filecontent}}</pre>
    {{/logs}}
    </div>
</div>
