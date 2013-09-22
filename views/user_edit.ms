<form action="#/users/{{Username}}/edit" id="form" method="put" class="form-horizontal">

<div class="panel panel-default">
    <div class="panel-heading">
        <h3 class="panel-title">{{Username}}</h3>
    </div>
    <div class="panel-body">
        <div class="form-group">
            <label for="username" class="col-sm-4 control-label">Username</label>
            <div class="col-sm-8">
                <input type="text" name="username" class="form-control" placeholder="{{Username}}" disabled>
            </div>
        </div>
        <div class="form-group">
            <label for="username" class="col-sm-4 control-label">Fullname</label>
            <div class="col-sm-8">
                <input type="text" name="username" class="form-control" placeholder="{{Fullname}}">
            </div>
        </div>
        <div class="form-group">
            <label for="username" class="col-sm-4 control-label">Mail</label>
            <div class="col-sm-8">
                <input type="email" name="username" class="form-control" placeholder="{{Mail}}">
            </div>
        </div>
    </div>
</div>

<div class="text-center">
    <input type="submit" class="btn btn-lg btn-success slide back" value="Save">
</div>

</form>
