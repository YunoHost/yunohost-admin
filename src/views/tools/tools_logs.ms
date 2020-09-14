<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/tools">{{t 'tools'}}</a>
    <a href="#/tools/logs">{{t 'logs'}}</a>
</div>

<div class="separator"></div>

{{#intl locales=locale}}
<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title">
            <span class="fa-fw fa-wrench"></span>{{t 'logs_operation'}}
        </h2>
    </div>
    <div class="list-group">
    {{#operations}}
        <a href="#/tools/logs/{{ name }}" class="list-group-item slide" title='{{formatTime started_at day="numeric" month="long" year="numeric" hour="numeric" minute="numeric"}}'><small style="margin-right:20px;" >{{formatRelative started_at}}</small>
        <span class="fa-fw fa-{{success_icon}}"></span> {{ description }}</a>
    {{/operations}}
    </div>
</div>
{{/intl}}
