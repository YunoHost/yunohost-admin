<div class="pull-left">
    <a href="#/services" class="btn btn-default slide back">
        <span class="fa-chevron-left"></span> Services list
    </a>
</div>
<div class="clearfix"></div>
<h1 class="view-title">{{service.name}}</h1>
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
            <a href="#/services/{{name}}/disable" class="btn btn-danger">
                <span class="fa-square-o"></span> Disable
            </a>
        {{/is_loaded}}
        {{^is_loaded}}
            <a href="#/services/{{name}}/enable" class="btn btn-success">
                <span class="fa-check-square-o"></span> Enable
            </a>
        {{/is_loaded}}

        {{#is_running}}
            <a href="#/services/{{name}}/stop" class="btn btn-danger">
                <span class="fa-stop"></span> Stop
            </a>
        {{/is_running}}
        {{^is_running}}
            <a href="#/services/{{name}}/start" class="btn btn-success">
                <span class="fa-play"></span> Start
            </a>
        {{/is_running}}
            <a href="#/services/{{name}}/log" class="btn btn-default slide">
                <span class="fa-book"></span> Log
            </a>
        </div>

    {{/service}}
</div>