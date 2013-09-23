<div class="pull-left">
    <a class="btn btn-lg btn-default slide back" href="#/users/{{Username}}"><span class="glyphicon glyphicon-chevron-left"></span> {{Username}} info</a>
</div>
<div class="clearfix"></div>
<div class="view-title">Edit {{Username}}</div>

<div class="br"></div>

<form action="#/users/{{Username}}" method="PUT" class="form-horizontal">

<div class="panel panel-default">
    <div class="panel-body">
        <div class="form-group">
            <label for="username" class="col-sm-4 control-label">Username</label>
            <div class="col-sm-8">
                <input type="text" name="username" class="form-control" placeholder="{{Username}}" disabled>
            </div>
        </div>
        <div class="form-group">
            <label for="firstname" class="col-sm-4 control-label">Fullname</label>
            <div class="col-sm-4">
                <input type="text" name="firstname" class="form-control" placeholder="{{Firstname}}">
            </div>
            <div class="col-sm-4">
                <input type="text" name="lastname" class="form-control" placeholder="{{Lastname}}">
            </div>
        </div>
        <div class="form-group">
            <label for="mail" class="col-sm-4 control-label">Mail</label>
            <div class="col-sm-8">
                <input type="email" name="mail" class="form-control" placeholder="{{Mail}}">
            </div>
        </div>
    </div>
</div>

<div class="text-center">
    <input type="submit" class="btn btn-lg btn-success slide back" value="Save">
</div>

</form>
