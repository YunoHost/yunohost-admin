<div class="pull-left">
    <a href="#/apps" class="btn btn-default slide back">
        <span class="fa-chevron-left"></span> App list
    </a>
</div>
<div class="pull-right">
</div>
<div class="clearfix"></div>
<h1 class="view-title">{{settings.label}}</h1>

<div class="br"></div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-info-circle"></span> Infos</h2>
    </div>
    <div class="panel-body">
        <dl class="dl-horizontal">
            <dt>ID</dt>
            <dd>{{settings.id}}</dd>
            <dt>Description</dt>
            <dd>{{manifest.description.en}}</dd>
            <dt>Mode</dt>
            <dd>{{settings.mode}}</dd>
            <dt>URL</dt>
            <dd><a href="https://{{settings.domain}}{{settings.path}}" target="_blank">https://{{settings.domain}}{{settings.path}}</a></dd>
        </dl>
    </div>
</div>

<div class="panel-group" id="accordion">
<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title">
            <a data-toggle="collapse" data-parent="#accordion" href="#collapseOne">
                <span class="fa-fw fa-wrench"></span> Operations
            </a>
        </h2>
    </div>
    <div id="collapseOne" class="panel-collapse collapse">
    <div class="panel-body">
        <div class="container">
            <p>Manage user access. Allowed users: {{settings.allowed_users}}.</p>
            <a href="#/apps/{{settings.id}}/access" class="btn btn-info slide">
                <span class="fa-lock"></span> Access
            </a>
        </div>
        <hr>
        <div class="container">
            <p>Redirect domain root to this application ({{settings.domain}}).</p>
            <a href="#/apps/{{settings.id}}/default" class="btn btn-success slide">
                <span class="fa-star"></span> Make default
            </a>
        </div>
        <hr>
        <div class="container">
            <p>Remove this application.</p>
            <a href="#/apps/{{settings.id}}/uninstall" class="btn btn-danger slide back">
                <span class="fa-trash-o"></span> Uninstall
            </a>
        </div>
    </div>
    </div>
</div>
</div>
