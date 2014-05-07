<div class="pull-left">
    <a href="#/tools" class="btn btn-default slide back">
       <span class="fa-chevron-left"></span> Tools
    </a>
</div>
<div class="clearfix"></div>
<h1 class="view-title">System update</h1>
<div class="br"></div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"> Packages</h2>
    </div>
    <div class="panel-body list-group">
    {{#if packages}}
        {{#packages}}
        <div class="list-group-item">
            <h3 class="list-group-item-heading">{{name}} <small>{{fullname}}</small></h3>
            <p class="list-group-item-text">{{changelog}}</p>
        </div>
        {{/packages}}

        <div class="br"></div>
        <a href="#/tools/upgrade/packages" class="btn btn-default">Upgrade packages</a>
    {{else}}
    There is no packages to upgrade.
    {{/if}}
    </div>
</div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"> Apps</h2>
    </div>
    <div class="panel-body list-group">
    {{#if apps}}
        {{#apps}}
        <div class="list-group-item">
            <h3 class="list-group-item-heading">{{label}} <small>{{id}}</small></h3>
        </div>
        {{/apps}}

        <div class="br"></div>
        <a href="#/tools/upgrade/apps" class="btn btn-success">Upgrade apps</a>
    {{else}}
    There is no apps to upgrade.
    {{/if}}
    </div>
</div>

