<div class="container pull-left">
    <div class="row">
        <div id="bc1" class="btn-group btn-breadcrumb">
            <a href="#/" class="btn btn-default"><i class="fa fa-home"></i></a>
            <a href="#/services" class="btn btn-default"><div>{{t 'services'}}</div></a>
            <a href="#/services/{{service.name}}" class="btn btn-default"><div>{{service.name}}</div></a>
            <a href="#/services/{{service.name}}/log" class="btn btn-default"><div>{{t 'service_log' name}}</div></a>
        </div>
    </div>
</div>
<div class="clearfix"></div>
<div class="br"></div>

<div class="container">
    {{#logs}}
        <h2>{{filename}}</h2>
        <pre class="service-log">
        {{filecontent}}
        </pre>
    {{/logs}}
</div>
