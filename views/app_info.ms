<div class="pull-left">
    <a href="#/apps" class="btn btn-default slide back"><span class="glyphicon glyphicon-chevron-left"></span> App list</a>
</div>
<div class="pull-right">
    <a href="#/apps/{{settings.id}}/access" class="btn btn-info slide"><span class="glyphicon glyphicon-lock"></span> Access</a>
</div>
<div class="clearfix"></div>
<div class="view-title">{{settings.label}}</div>

<div class="br"></div>

<ul class="list-group">
    <li class="list-group-item">
        <div class="row">
            <div class="col-sm-3 text-right hidden-xs"><strong>ID</strong></div>
            <div class="col-sm-3 visible-xs"><strong>ID</strong></div>
            <div class="col-sm-9"> {{settings.id}}</div>
        </div>
    </li>
    <li class="list-group-item">
        <div class="row">
            <div class="col-sm-3 text-right hidden-xs"><strong>Description</strong></div>
            <div class="col-sm-3 visible-xs"><strong>Description</strong></div>
            <div class="col-sm-9"> {{manifest.description.en}}</div>
        </div>
    </li>
    <li class="list-group-item">
        <div class="row">
            <div class="col-sm-3 text-right hidden-xs"><strong>URL</strong></div>
            <div class="col-sm-3 visible-xs"><strong>URL</strong></div>
            <div class="col-sm-9"> <a href="http://{{settings.domain}}{{settings.path}}" target="_blank">http://{{settings.domain}}{{settings.path}}</a></div>
        </div>
    </li>
</ul>

<div class="text-center">
    <a href="#/apps/{{settings.id}}/uninstall" class="btn btn-danger slide back"><span class="glyphicon glyphicon-trash"></span> Uninstall</a>
</div>
