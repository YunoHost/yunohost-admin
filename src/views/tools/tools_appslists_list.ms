<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/tools">{{t 'tools'}}</a>
    <a href="#/tools/appslists">{{t 'appslists'}}</a>
</div>

<div class="separator"></div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-list"></span> {{t 'appslists'}}</h2>
    </div>

    <div class="list-group">
        {{#appslists}}
        <a href="#/tools/appslists/{{name}}" class="list-group-item">
            <span class="fa-chevron-right pull-right"></span>
            <h2 class="list-group-item-heading">
                {{name}}
            </h2>
        </a>
        {{/appslists}}
        {{^appslists}}
        <p class="list-group-item text-warning">
            <span class="fa-exclamation-triangle"></span>
            {{t 'appslists_no_lists'}}
        </p>
        {{/appslists}}
    </div>
</div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-plus"></span> {{t 'appslists_custom'}}</h2>
    </div>
    <div class="panel-body">
        <form action="#/tools/appslists" method="POST" class="form-horizontal">
            <div class="form-group has-feedback">
                <label for="appslist_name" class="col-md-2 col-sm-12 control-label">{{t 'name'}}</label>
                <div class="col-md-10 col-sm-12">
                    <input type="text" id="appslist_name" name="appslist_name" class="form-control" value="" required />
                </div>
            </div>
            <div class="form-group has-feedback">
                <label for="appslist_url" class="col-md-2 col-sm-12 control-label">{{t 'url'}}</label>
                <div class="col-md-10 col-sm-12">
                    <input type="url" id="appslist_url" name="appslist_url" class="form-control" value="" placeholder="https://some.domain.tld/somelist.json" required />
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
