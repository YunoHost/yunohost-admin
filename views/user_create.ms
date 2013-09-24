<div class="pull-left">
    <a class="btn btn-lg btn-default slide back" href="#/users"><span class="glyphicon glyphicon-chevron-left"></span> User list</a>
</div>
<div class="clearfix"></div>
<div class="view-title">New user</div>

<div class="br"></div>

<form action="#/users" method="POST" class="form-horizontal">

<div class="panel panel-default">
    <div class="panel-body">
        <div class="form-group">
            <label for="username" class="col-sm-4 control-label">Username</label>
            <div class="col-sm-8">
                <input type="text" name="username" class="form-control" placeholder="johndoe" required>
            </div>
        </div>
        <div class="form-group">
            <label for="firstname" class="col-sm-4 control-label">Fullname</label>
            <div class="col-sm-4">
                <input type="text" name="firstname" class="form-control" placeholder="John" required>
            </div>
            <div class="col-sm-4">
                <input type="text" name="lastname" class="form-control" placeholder="Doe" required>
            </div>
        </div>
        <hr>
        <div class="form-group">
            <label for="mail" class="col-sm-4 control-label">Mail</label>
            <div class="col-sm-3" style="padding-right: 3px">
                <input type="text" name="email" class="form-control" placeholder="johndoe" required>
            </div>
            <div class="col-sm-5" style="padding-left: 0">
               <select class="form-control" name="domain">
                   {{#Domains}}
                       <option>@{{.}}</option>
                   {{/Domains}}
               </select>
            </div>
        </div>
        <hr>
        <div class="form-group">
            <label for="password" class="col-sm-4 control-label">Password</label>
            <div class="col-sm-8">
                <input type="password" name="password" class="form-control" placeholder="•••••" required>
            </div>
        </div>
        <div class="form-group">
            <label for="confirmation" class="col-sm-4 control-label">Confirmation</label>
            <div class="col-sm-8">
                <input type="password" name="confirmation" class="form-control" placeholder="•••••" required>
            </div>
        </div>
    </div>
</div>

<div class="text-center">
    <input type="submit" class="btn btn-lg btn-success slide back" value="Save">
</div>

</form>
