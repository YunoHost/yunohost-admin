<div class="pull-left">
    <a href="#/services/{{name}}" class="btn btn-default slide back"><span class="glyphicon glyphicon-chevron-left"></span>{{name}}</a>
</div>
<div class="clearfix"></div>
<div class="view-title">{{name}} log</div>
<div class="br"></div>

<div class="container">
    {{#logs}}
        <h2>{{filename}}</h2>
        <pre class="service-log">
        {{filecontent}}
        </pre>
    {{/logs}}
</div>