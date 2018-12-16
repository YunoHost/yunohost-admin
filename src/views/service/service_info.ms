<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/services">{{t 'services'}}</a>
    <a href="#/services/{{service.name}}">{{service.name}}</a>
</div>

<div class="separator"></div>


<div class="panel panel-default">
    <div class="panel-heading">
    <h2 class="panel-title"><span class="fa-fw fa-info-circle"></span> {{t 'infos'}}</h2>
    </div>
    <div class="panel-body">
    {{#service}}
        <dl class="dl-horizontal">
            <dt>{{t 'name'}}</dt>
            <dd>{{name}}</dd>
            <dt>{{t 'description'}}</dt>
            <dd>{{description}}</dd>
        </dl>
    {{/service}}
    </div>
</div>


<div class="panel panel-default">
    <div class="panel-heading">
    <h2 class="panel-title"><span class="fa-fw fa-wrench"></span> {{t 'status'}}</h2>
    </div>
    <div class="panel-body">
        <dl class="dl-horizontal">
    {{#service}}
        <div class="pull-left">
            {{t 'service_start_on_boot'}}
            <span class="text-{{#is_loaded}}success{{/is_loaded}}{{^is_loaded}}danger{{/is_loaded}}">
            {{loaded}}
            </span>
            <br>
            {{t 'service_status'}}
            <span class="text-{{#is_running}}success{{/is_running}}{{^is_running}}danger{{/is_running}}">
            {{active}}
            </span>
            <br>
            {{t 'started_at'}}
            {{#active_at}}
            {{formatTime . day="numeric" month="long" year="numeric" hour="numeric" minute="numeric"}}
            {{/active_at}}
            {{^active_at}}
            {{t 'unknown'}}
            {{/active_at}}
        </div>

        <div class="pull-right">
        {{#is_loaded}}
            <a href="#/services/{{name}}/disable" role="button" class="btn btn-danger">
                <span class="fa-square-o"></span> {{t 'disable'}}
            </a>
        {{/is_loaded}}
        {{^is_loaded}}
            <a href="#/services/{{name}}/enable" role="button" class="btn btn-success">
                <span class="fa-check-square-o"></span> {{t 'enable'}}
            </a>
        {{/is_loaded}}

        {{#is_running}}
            <a href="#/services/{{name}}/stop" role="button" class="btn btn-danger">
                <span class="fa-stop"></span> {{t 'stop'}}
            </a>
        {{/is_running}}
        {{^is_running}}
            <a href="#/services/{{name}}/start" role="button" class="btn btn-success">
                <span class="fa-play"></span> {{t 'start'}}
            </a>
        {{/is_running}}
            <a href="#/services/{{name}}/log" role="button" class="btn btn-default slide">
                <span class="fa-book"></span> {{t 'log'}}
            </a>
        </div>

    {{/service}}
        </dl>
    </div>
</div>
