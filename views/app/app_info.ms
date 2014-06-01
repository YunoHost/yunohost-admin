<div class="pull-left">
    <a href="#/apps" class="btn btn-default slide back">
        <span class="fa-chevron-left"></span> {{t 'app_list'}}
    </a>
</div>
<div class="pull-right">
</div>
<div class="clearfix"></div>
<h1 class="view-title">{{settings.label}}</h1>

<div class="br"></div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-info-circle"></span> {{t 'infos'}}</h2>
    </div>
    <div class="panel-body">
        <dl class="dl-horizontal">
            <dt>{{t 'id'}}</dt>
            <dd>{{settings.id}}</dd>
            <dt>{{t 'description'}}</dt>
            <dd>{{description}}</dd>
            <dt>{{t 'multi_instance'}}</dt>
            <dd>{{#if manifest.multi_instance}}{{t 'yes'}}{{else}}{{t 'no'}}{{/if}}</dd>
            <dt>{{t 'url'}}</dt>
            <dd><a href="https://{{settings.domain}}{{settings.path}}" target="_blank">https://{{settings.domain}}{{settings.path}}</a></dd>
        </dl>
    </div>
</div>

<div class="panel-group" id="accordion">
<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title">
            <a data-toggle="collapse" data-parent="#accordion" href="#collapseOne">
                <span class="fa-fw fa-wrench"></span> {{t 'operations'}}
            </a>
        </h2>
    </div>
    <div id="collapseOne" class="panel-collapse collapse">
    <div class="panel-body">
        <div class="container">
            <p>{{t 'app_info_access_desc' settings.allowed_users}}</p>
            <a href="#/apps/{{settings.id}}/access" class="btn btn-info slide">
                <span class="fa-lock"></span> {{t 'app_access'}}
            </a>
        </div>
        <hr>
        <div class="container">
            <p>{{t 'app_info_default_desc' settings.domain}}</p>
            <a href="#/apps/{{settings.id}}/default" class="btn btn-success slide">
                <span class="fa-star"></span> {{t 'app_make_default'}}
            </a>
        </div>
        <hr>
        <div class="container">
            <p>{{t 'app_info_uninstall_desc'}}</p>
            <a href="#/apps/{{settings.id}}/uninstall" class="btn btn-danger slide back">
                <span class="fa-trash-o"></span> {{t 'uninstall'}}
            </a>
        </div>
    </div>
    </div>
</div>
</div>
