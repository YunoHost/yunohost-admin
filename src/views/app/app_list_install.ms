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
    <a href="#/apps/install/{{id}}" class="list-group-item slide" title="{{t 'install'}}">
        <span class="fa-chevron-right pull-right"></span>
        <h2 class="list-group-item-heading">
            {{name}} <small>{{id}}</small>
            {{#installed}}<span class="badge badge-success" title="{{t 'status'}}">{{t 'installed'}}</span>{{/installed}}
        </h2>
        <p class="list-group-item-text">{{description}}</p>
        {{^official}}
            <p class="list-group-item-text">{{t 'app_repository'}}{{repository}}</p>
            <p class="list-group-item-text">{{t 'app_state'}}{{state}}</p>
        {{/official}}
    </a>
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
            {{t 'install_custom_app_appslist_info'}}</p>
            <p>
                <a href="#/apps/list" class="btn btn-info">{{t 'appslists_manage'}}</a>
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
