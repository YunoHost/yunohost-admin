<div class="pull-left">
    <a href="#/services" class="btn btn-default slide back"><span class="glyphicon glyphicon-chevron-left"></span> Services list</a>
</div>
<div class="clearfix"></div>
<div class="view-title">{{service.name}}</div>
<div class="br"></div>

<div class="container">

    <h2>Status</h2>
    {{#service}}
        <div class="pull-left">
            Start on boot:
            <span class="text-{{#is_loaded}}success{{/is_loaded}}{{^is_loaded}}danger{{/is_loaded}}">
            {{loaded}}
            </span>
            <br>
            Status: 
            <span class="text-{{#is_running}}success{{/is_running}}{{^is_running}}danger{{/is_running}}">
            {{status}}
            </span>
        </div>

        <div class="pull-right">
        {{#is_loaded}}
            <a href="#/services/{{name}}/disable" class="btn btn-danger slide back">
                <span class="glyphicon glyphicon-remove"></span> Disable
            </a>
        {{/is_loaded}}
        {{^is_loaded}}
            <a href="#/services/{{name}}/enable" class="btn btn-success slide back">
                <span class="glyphicon glyphicon-ok"></span> Enable
            </a>
        {{/is_loaded}}

        {{#is_running}}
            <a href="#/services/{{name}}/stop" class="btn btn-danger slide back">
                <span class="glyphicon glyphicon-stop"></span> Stop
            </a>
        {{/is_running}}
        {{^is_running}}
            <a href="#/services/{{name}}/start" class="btn btn-success slide back">
                <span class="glyphicon glyphicon-play"></span> Start
            </a>
        {{/is_running}}
            <a href="#/services/{{name}}/log" class="btn btn-default slide back">
                <span class="glyphicon glyphicon-book"></span> Log
            </a>
        </div>

    {{/service}}
</div>