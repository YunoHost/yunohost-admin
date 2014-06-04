{{#installed}}
<div class="pull-left">
    <a href="#/" class="btn btn-default slide back">
        <span class="fa-chevron-left"></span> {{t 'menu'}}
    </a>
</div>
<div class="pull-right">
    <a href="#/apps/install" class="btn btn-success slide">
        <span class="fa-plus"></span> {{t 'install'}}
    </a>
</div>
<div class="clearfix"></div>
<h1 class="view-title">{{t 'installed_apps'}}</h1>
{{/installed}}


{{^installed}}
<div class="pull-left">
    <a href="#/apps" class="btn btn-default slide back">
        <span class="fa-chevron-left"></span> {{t 'installed_apps'}}
    </a>
</div>
<div class="pull-right">
    <a href="#/apps/refresh" class="btn btn-info">
        <span class="fa-refresh"></span> {{t 'refresh_app_list'}}
    </a>
</div>
<div class="clearfix"></div>
<h1 class="view-title">{{t 'available_apps'}}</h1>
{{/installed}}

<div class="br"></div>

<div class="list-group">
{{#apps}}
    <a href="#/apps/{{^installed}}install/{{/installed}}{{id}}" class="list-group-item slide">
        <span class="fa-chevron-right pull-right"></span>
        <h2 class="list-group-item-heading">{{name}} <small>{{id}}</small></h2>
        <p class="list-group-item-text">{{description.en}}</p>
    </a>
{{/apps}}

{{^apps}}
<div class="alert alert-warning">
    <span class="fa-exclamation-triangle"></span>
    {{t 'no_installed_apps'}}
</div>
{{/apps}}

</div>

{{^installed}}
<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-download"></span> {{t 'custom_app_install'}}</h2>
    </div>
    <div class="panel-body">
        <form action="#/apps/install/custom" method="POST" class="form-horizontal">
            <div class="form-group has-feedback">
                <label for="label" class="col-sm-12">{{t 'url'}}</label>
                <div class="col-sm-12">
                    <input type="url" id="url" name="url" class="form-control" value="" placeholder="https://github.com/USER/REPOSITORY" required pattern="^https://github.com/[a-z]*/[a-z]*">
                    <p class="text-warning">
                        <span class="fa-github"></span> {{t 'custom_app_url_only_github'}}
                    </p>
                </div>
            </div>
            <div class="form-group">
                <div class="text-center">
                    <input type="submit" class="btn btn-success slide back" value="{{t 'install'}}">
                </div>
            </div>
        </form>
    </div>
</div>

{{/installed}}