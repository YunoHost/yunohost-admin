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
        <pre id="log" class="service-log">
        {{filecontent}}
        </pre>
        <button data-paste-content="#log"><i class="fa-cloud-upload"></i> {{t 'upload'}}</button>
    {{/logs}}
</div>
