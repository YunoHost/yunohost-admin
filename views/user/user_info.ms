<div class="pull-left">
    <a href="#/users" class="btn btn-default slide back">
        <span class="fa-chevron-left"></span> {{t 'users_list'}}
    </a>
</div>
<div class="pull-right">
    <a href="#/users/{{Username}}/edit" class="btn btn-info slide">
        <span class="fa-edit"></span> {{t 'user_username_edit' Username}}
    </a>
</div>
<div class="clearfix"></div>
<h1 class="view-title">{{Username}}</h1>

<div class="br"></div>

<ul class="list-group">
    <li class="list-group-item">
        <div class="row">
            <div class="col-sm-3 text-right hidden-xs"><strong>{{t 'user_username'}}</strong></div>
            <div class="col-sm-3 visible-xs"><strong>{{t 'user_username'}}</strong></div>
            <div class="col-sm-9"> {{Username}}</div>
        </div>
    </li>
    <li class="list-group-item">
        <div class="row">
            <div class="col-sm-3 text-right hidden-xs"><strong>{{t 'user_fullname'}}</strong></div>
            <div class="col-sm-3 visible-xs"><strong>{{t 'user_fullname'}}</strong></div>
            <div class="col-sm-9"> {{Fullname}}</div>
        </div>
    </li>
    <li class="list-group-item">
        <div class="row">
            <div class="col-sm-3 text-right hidden-xs"><strong>{{t 'user_email'}}</strong></div>
            <div class="col-sm-3 visible-xs"><strong>{{t 'user_email'}}</strong></div>
            <div class="col-sm-9"> {{Mail}}</div>
        </div>
    </li>
</ul>

<div class="text-center">
    <a href="#/users/{{Username}}/delete" class="btn btn-danger slide back">
        <span class="fa-trash-o"></span> {{t 'delete'}}
    </a>
</div>
