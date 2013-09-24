<div class="pull-left">
    <a href="#/users" class="btn btn-default slide back"><span class="glyphicon glyphicon-chevron-left"></span> User list</a>
</div>
<div class="pull-right">
    <a href="#/users/{{Username}}/edit" class="btn btn-info slide"><span class="glyphicon glyphicon-edit"></span> Edit</a>
</div>
<div class="clearfix"></div>
<div class="view-title">{{Username}}</div>

<div class="br"></div>

<ul class="list-group">
    <li class="list-group-item">
        <div class="row">
            <div class="col-sm-3 text-right hidden-xs"><strong>Username</strong></div>
            <div class="col-sm-3 visible-xs"><strong>Username</strong></div>
            <div class="col-sm-9"> {{Username}}</div>
        </div>
    </li>
    <li class="list-group-item">
        <div class="row">
            <div class="col-sm-3 text-right hidden-xs"><strong>Fullname</strong></div>
            <div class="col-sm-3 visible-xs"><strong>Fullname</strong></div>
            <div class="col-sm-9"> {{Fullname}}</div>
        </div>
    </li>
    <li class="list-group-item">
        <div class="row">
            <div class="col-sm-3 text-right hidden-xs"><strong>Mail</strong></div>
            <div class="col-sm-3 visible-xs"><strong>Mail</strong></div>
            <div class="col-sm-9"> {{Mail}}</div>
        </div>
    </li>
</ul>

<div class="text-center">
    <a href="#/users/{{Username}}/delete" class="btn btn-danger slide back"><span class="glyphicon glyphicon-trash"></span> Delete</a>
</div>
