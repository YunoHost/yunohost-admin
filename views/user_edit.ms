<div class="pull-left">
    <a href="#/users/{{Username}}" class="btn btn-default slide back"><span class="glyphicon glyphicon-chevron-left"></span> Info</a>
</div>
<div class="clearfix"></div>
<div class="view-title">Edit {{Username}}</div>

<div class="br"></div>

<form action="#/users/{{Username}}" method="PUT" class="form-horizontal">

<div class="panel panel-default">
    <div class="panel-body">
        <div class="form-group">
            <label for="username" class="col-sm-3 control-label">Username</label>
            <div class="col-sm-9">
                <input type="text" name="username" class="form-control" placeholder="{{Username}}" disabled>
            </div>
        </div>
        <div class="form-group">
            <label for="firstname" class="col-sm-3 control-label">Fullname</label>
            <div class="clearfix visible-xs"></div>
            <div class="col-sm-4 col-xs-6">
                <input type="text" name="firstname" class="form-control" placeholder="{{Firstname}}">
            </div>
            <div class="col-sm-5 col-xs-6">
                <input type="text" name="lastname" class="form-control" placeholder="{{Lastname}}">
            </div>
        </div>
        <div class="form-group">
            <label for="mail" class="col-sm-3 control-label">Mail</label>
            <div class="col-sm-9">
                <input type="email" name="mail" class="form-control" placeholder="{{Mail}}">
            </div>
        </div>
    </div>
</div>

<div class="text-center">
    <input type="submit" class="btn btn-success slide back" value="Save">
</div>

</form>
