<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/apps">{{t 'applications'}}</a>
    <a href="#/apps/install">{{t 'install'}}</a>
</div>

<div class="actions-group">
    <a href="#/apps/lists" class="btn btn-success">
        <span class="fa-list"></span> {{t 'appslists_manage'}}
    </a>
    <a href="#/apps/lists/refresh" class="btn btn-info">
        <span class="fa-refresh"></span> {{t 'refresh_app_list'}}
    </a>
</div>

<div class="separator"></div>

<div class="list-group">
{{#apps}}
  <div class="app-card_ampache app-card panel panel-default" id="app-card_ampache">
        <div class="panel-body">
            <h3>{{name}}</h3>
            <div class="category"> <span class="label label-success label-as-badge">{{level}}</span>
            <span class="label label-success label-as-badge app-validated">validated</span>
            <span class="label label-default">AGPL-3.0</span></div>
            <div class="app-card-desc">{{description}}</div>
        </div>
            <div class="app-card-date-maintainer">
                <span class="glyphicon glyphicon-refresh"></span> 10 April 2018 -
                <span title="Current maintainer of this package" class="maintained"><span class="glyphicon glyphicon-user"></span> aymhce</span>
            </div>
            <div class="btn-group" role="group">
                <a href="https://github.com/YunoHost-Apps/ampache_ynh" target="_BLANK" type="button" class="btn btn-default col-sm-4">
                    <span class="glyphicon glyphicon-globe" aria-hidden="true"></span>
                    Code
                </a>
                <a href="#/app_ampache_en" target="_BLANK" type="button" class="btn btn-default col-sm-4">
                    <span class="glyphicon glyphicon-book" aria-hidden="true"></span>
                    Doc
                </a>
                <a href="#/apps/install/{{id}}" target="_BLANK" type="button" class="btn btn-success col-sm-4 active">
                    <span class="glyphicon glyphicon-plus" aria-hidden="true"></span>
                    Install
                </a>
            </div>
    </div>
{{/apps}}
</div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-download"></span> {{t 'custom_app_install'}}</h2>
    </div>
    <div class="panel-body">
        <p class="alert alert-warning">
            <span class="fa-warning"></span>
            {{t 'confirm_install_custom_app'}}
        </p>
        <div class="alert alert-info">
            <p><span class="fa-lightbulb-o"></span>
            {{t 'install_custom_app_appslists_info'}}</p>
            <p>
                <a href="#/apps/lists" class="btn btn-info">{{t 'appslists_manage'}}</a>
            </p>
        </div>
        <form action="#/apps/install/custom" method="POST" class="form-horizontal">
            <div class="form-group has-feedback">
                <label for="url" class="col-sm-12">{{t 'url'}}</label>
                <div class="col-sm-12">
                    <input type="url" id="url" name="url" class="form-control" value="" placeholder="https://github.com/USER/REPOSITORY" required pattern="^https://github.com/[a-zA-Z0-9-_.]+/[a-zA-Z0-9-_.]+[/]?$">
                    <p class="text-warning">
                        <span class="fa-github"></span> {{t 'custom_app_url_only_github'}}
                    </p>
                </div>
            </div>
            <div class="form-group">
                <div class="text-center">
                    <input type="submit" class="btn btn-success slide" value="{{t 'install'}}">
                </div>
            </div>
        </form>
    </div>
</div>
