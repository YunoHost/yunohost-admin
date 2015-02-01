<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/services">{{t 'services'}}</a>
    <a href="#/services/{{name}}">{{name}}</a>
    <a href="#/services/{{name}}/log">{{t 'log'}}</a>
</div>

<div class="separator"></div>

<div class="container">
    {{#logs}}
        <h2>{{filename}}</h2>
        <pre class="service-log">
        {{filecontent}}
        </pre>
    {{/logs}}
</div>
