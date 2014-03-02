<div class="pull-left">
    <a href="#/users" class="btn btn-default slide back"><span class="glyphicon glyphicon-chevron-left"></span> User list</a>
</div>
<div class="clearfix"></div>
<div class="view-title">New user</div>

<div class="br"></div>

<form action="#/users" method="POST" class="form-horizontal">

<div class="panel panel-default">
    <div class="panel-body">
        <div class="form-group">
            <label for="username" class="col-sm-3 control-label">Username</label>
            <div class="col-sm-9">
                <input type="text" name="username" class="form-control" placeholder="johndoe" required>
            </div>
        </div>
        <div class="form-group">
            <label for="firstname" class="col-sm-3 control-label">Fullname</label>
            <div class="clearfix visible-xs"></div>
            <div class="col-sm-4 col-xs-6">
                <input type="text" name="firstname" class="form-control" placeholder="John" required>
            </div>
            <div class="col-sm-5 col-xs-6">
                <input type="text" name="lastname" class="form-control" placeholder="Doe" required>
            </div>
        </div>
        <hr>
        <div class="form-group">
            <label for="mail" class="col-sm-3 control-label">Mail</label>
            <div class="clearfix visible-xs"></div>
            <div class="col-sm-4 col-xs-6">
                <input type="text" name="email" class="form-control" placeholder="johndoe" required>
            </div>
            <div class="col-sm-5 col-xs-6">
               <select class="form-control" name="domain">
                   {{#Domains}}
                       <option>@{{.}}</option>
                   {{/Domains}}
               </select>
            </div>
        </div>
        <hr>
        <div class="form-group">
            <label for="password" class="col-sm-3 control-label">Password</label>
            <div class="col-sm-9">
                <input type="password" name="password" class="form-control" placeholder="•••••" required>
            </div>
        </div>
        <div class="form-group">
            <label for="confirmation" class="col-sm-3 control-label">Confirmation</label>
            <div class="col-sm-9">
                <input type="password" name="confirmation" class="form-control" placeholder="•••••" required>
                <div class="help-block">Password must be at least 4 characters long.</div>
            </div>
        </div>
    </div>
</div>

<div class="text-center">
    <input type="submit" class="btn btn-success slide back" value="Save">
</div>

</form>
