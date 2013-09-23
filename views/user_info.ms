<div class="pull-left">
    <a class="btn btn-lg btn-default slide back" href="#/users"><span class="glyphicon glyphicon-chevron-left"></span> User list</a>
</div>
<div class="pull-right">
    <a href="#/users/{{Username}}/edit" class="btn btn-lg btn-info slide"><span class="glyphicon glyphicon-edit"></span> Edit</a>
</div>
<div class="clearfix"></div>
<div class="view-title">{{Username}}</div>

<div class="br"></div>

<ul class="list-group">
    <li class="list-group-item">
        <div class="row">
            <div class="col-sm-4 text-right"><strong>Username</strong></div>
            <div class="col-sm-8"> {{Username}}</div>
        </div>
    </li>
    <li class="list-group-item">
        <div class="row">
            <div class="col-sm-4 text-right"><strong>Fullname</strong></div>
            <div class="col-sm-8"> {{Fullname}}</div>
        </div>
    </li>
    <li class="list-group-item">
        <div class="row">
            <div class="col-sm-4 text-right"><strong>Mail</strong></div>
            <div class="col-sm-8"> {{Mail}}</div>
        </div>
    </li>
</ul>

<div class="text-center">
    <a href="#/users/{{Username}}/delete" class="btn btn-lg btn-danger slide back"><span class="glyphicon glyphicon-trash"></span> Delete</a>
</div>
