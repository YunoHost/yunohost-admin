<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/apps" class="hidden-xs">{{t 'applications'}}</a>
    <a href="#/apps" class="visible-xs">&hellip;</a>
    <a href="#/apps/{{id}}">{{label}}</a>
    <a href="#/apps/{{id}}/changelabel">{{t 'app_change_label'}}</a>
</div>

<div class="separator"></div>

<form action="#/apps/{{id}}/changelabel" method="POST" class="form-horizontal form-app-install">
    <div class="panel panel-default">
        <div class="panel-heading">
            <h2 class="panel-title"><span class="fa-fw fa-tag"></span> {{t 'app_change_label'}}</h2>
        </div>
        <div class="panel-body">
            <div class="form-group">
                <label for="label" class="col-sm-12">{{t 'label'}}</label>
                <div class="col-sm-12">
                    <input class="col-sm-12" type="text" id="label" name="label" class="form-control" value="{{label}}" required="required">
                </div>
            </div>
            <hr>
            <input type="hidden" name="app" value="{{id}}">
            <div class="text-center">
                <input type="submit" role="button" class="btn btn-success slide back" value="{{t 'app_change_label'}}">
            </div>
        </div>
    </div>
</form>
