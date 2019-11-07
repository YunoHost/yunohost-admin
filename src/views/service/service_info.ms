<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/services">{{t 'services'}}</a>
    <a href="#/services/{{service.name}}">{{name}}</a>
</div>

<div class="separator"></div>


<div class="panel panel-default">
    <div class="panel-heading">
    <h2 class="panel-title"><span class="fa-fw fa-info-circle"></span> {{t 'infos'}}</h2>
    </div>
    <div class="panel-body">
    <dl class="dl-horizontal">

        <dt>{{t 'name'}}</dt>
        <dd>{{name}}</dd>

        <dt>{{t 'description'}}</dt>
        <dd>{{description}}</dd>

        <dt>{{t 'status'}}</dt>
        <dd>
        {{#if (eq status "running")}}
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
    <h2 class="panel-title"><span class="fa-fw fa-wrench"></span> {{t 'operations'}}</h2>
    </div>
    <div class="panel-body">
        <dl class="dl-horizontal">

        {{#if (eq status "running")}}
            <button class="btn btn-danger" data-service="{{name}}" data-action="stop">
                <span class="fa-stop"></span> {{t 'stop'}}
            </button>
        {{else}}
            <button class="btn btn-success" data-service="{{name}}" data-action="start">
                <span class="fa-play"></span> {{t 'start'}}
            </button>
        {{/if}}
            <a href="#/services/{{name}}/log" role="button" class="btn btn-default slide">
                <span class="fa-book"></span> {{t 'log'}}
            </a>

        </dl>
    </div>
</div>
