<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/services">{{t 'services'}}</a>
</div>

<div class="separator"></div>

<div class="list-group">
{{#services}}
    <a href="#/services/{{name}}" class="list-group-item slide service-{{name}}">
        <span class="fa-chevron-right pull-right"></span>
        <h2 class="list-group-item-heading">{{name}} <small>{{description}}</small></h2>
        <div class="list-group-item-text">
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
    </a>
{{/services}}
</div>
