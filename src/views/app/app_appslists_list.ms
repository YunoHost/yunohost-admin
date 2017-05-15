<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/apps">{{t 'applications'}}</a>
    <a href="#/apps/lists">{{t 'appslists'}}</a>
</div>

<div class="separator"></div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-list"></span> {{t 'appslists'}}</h2>
    </div>

    <div class="list-group">
        {{#appslists}}
        <a href="#/apps/lists/{{name}}" class="list-group-item">
            <span class="fa-chevron-right pull-right"></span>
            <h2 class="list-group-item-heading">
                {{name}}
            </h2>
        </a>
        {{/appslists}}
    </div>
</div>

{{^has_community_list}}
<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-plus"></span> {{t 'appslists_community_list'}}</h2>
    </div>
    <div class="panel-body">
        <form action="#/apps/lists" method="POST" class="form-horizontal">
            <input type="hidden" id="appslist_name" name="appslist_name" value="community" required />
            <input type="hidden" id="appslist_url" name="appslist_url" value="https://app.yunohost.org/community.json" required />
            <div class="form-group">
                <div class="col-md-10 col-sm-12">
                    <p>{{t 'install_community_appslists_info'}}</p>
                    <p class="alert alert-danger">
                        <span class="fa-warning"></span> {{t 'install_community_appslists_warning'}}
                    </p>
                    <input type="submit" class="btn btn-success slide" value="{{t 'add'}}">
                </div>
            </div>
        </form>
    </div>
</div>
{{/has_community_list}}

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-plus"></span> {{t 'appslists_custom'}}</h2>
    </div>
    <div class="panel-body">
        <form action="#/apps/lists" method="POST" class="form-horizontal">
            <div class="form-group has-feedback">
                <label for="appslist_name" class="col-md-2 col-sm-12 control-label">{{t 'name'}}</label>
                <div class="col-md-10 col-sm-12">
                    <input type="text" id="appslist_name" name="appslist_name" class="form-control" value="" required />
                </div>
            </div>
            <div class="form-group has-feedback">
                <label for="appslist_url" class="col-md-2 col-sm-12 control-label">{{t 'url'}}</label>
                <div class="col-md-10 col-sm-12">
                    <input type="url" id="appslist_url" name="appslist_url" class="form-control" value="" placeholder="https://app.yunohost.org/community.json" required />
                </div>
            </div>
            <div class="form-group">
                <div class="col-md-10 col-md-push-2 col-sm-12">
                    <input type="submit" class="btn btn-success slide" value="{{t 'add'}}">
                </div>
            </div>
        </form>
    </div>
</div>
