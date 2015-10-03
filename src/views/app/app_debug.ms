<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/apps">{{t 'applications'}}</a>
    <a href="#/apps/{{name}}">{{label}}</a>
    <a href="#/apps/{{name}}/debug">{{t 'debug'}}</a>
</div>


<div class="separator"></div>

<h1>Debug page for {{name}}</h1>

<hr>

{{#services}}
<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-info-circle"></span> Logs for the service {{name}}</h2>
    </div>
    <div class="panel-body">
    {{#logs}}
        <h3>{{file_name}}</h3>
        <pre class="service-log">{{file_content}}
        </pre>
    {{/logs}}
    </div>
</div>
{{/services}}
