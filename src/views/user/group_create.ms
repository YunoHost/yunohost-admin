<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/users" class="visible-xs">&hellip;</a>
    <a href="#/users" class="hidden-xs">{{t 'users'}}</a>
    <a href="#/groups" class="visible-xs">&hellip;</a>
    <a href="#/groups" class="hidden-xs">{{t 'group_permissions'}}</a>
    <a href="#/groups/create">{{t 'group_new'}}</a>
</div>

<div class="separator"></div>

<form action="#/groups/create" method="POST" class="form-horizontal">

<div class="panel panel-default">
    <div class="panel-body">
        <div class="form-group">
            <label for="groupname" class="col-sm-3 control-label">{{t 'group_name'}}</label>
            <div class="col-sm-9">
                <input type="text" id="groupname" name="groupname" class="form-control" placeholder="my group name" required pattern="[A-Za-z0-9_ ]+">
                <div class="help-block">{{t 'group_format_name_help'}}</div>
            </div>
        </div>
    </div>
</div>

<div class="text-center">
    <input type="submit" role="button" class="btn btn-success slide back" value="{{t 'save'}}">
</div>

</form>
