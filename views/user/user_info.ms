<div class="container pull-left">
    <div class="row">
        <div id="bc1" class="btn-group btn-breadcrumb">
            <a href="#/" class="btn btn-default"><i class="fa fa-home"></i></a>
            <a href="#/users" class="btn btn-default hidden-xs"><div>{{t 'users_list'}}</div></a>
            <a href="#/users" class="btn btn-default visible-xs"><div>...</div></a>
            <a href="#/users/{{username}}" class="btn btn-default"><div>{{username}}</div></a>
        </div> 
    </div>
</div> 
<div class="pull-right hidden-xs">
    <a href="#/users/{{username}}/edit" class="btn btn-info slide">
        <span class="fa-edit"></span> {{t 'user_username_edit' username}}
    </a>
</div>
<div class="clearfix"></div>

<div class="br"></div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-user"></span> {{fullname}}</h2>
    </div>
    <ul class="panel-body list-group">
        <li class="list-group-item row">
            <div class="col-sm-3 text-right hidden-xs"><strong>{{t 'user_username'}}</strong></div>
            <div class="col-sm-3 visible-xs"><strong>{{t 'user_username'}}</strong></div>
            <div class="col-sm-9"> {{username}}</div>
        </li>
        <li class="list-group-item row">
            <div class="col-sm-3 text-right hidden-xs"><strong>{{t 'user_email'}}</strong></div>
            <div class="col-sm-3 visible-xs"><strong>{{t 'user_email'}}</strong></div>
            <div class="col-sm-9"> {{mail}}</div>
        </li>
        <li class="list-group-item row">
            <div class="col-sm-3 text-right hidden-xs"><strong>{{t 'user_emailaliases'}}</strong></div>
            <div class="col-sm-3 visible-xs"><strong>{{t 'user_emailaliases'}}</strong></div>
            <div class="col-sm-9">
            {{#if mail-aliases}}
                {{#mail-aliases}}
                    {{.}}<br>
                {{/mail-aliases}}
            {{/if}}
            </div>
        </li>
        <li class="list-group-item row">
            <div class="col-sm-3 text-right hidden-xs"><strong>{{t 'user_emailforward'}}</strong></div>
            <div class="col-sm-3 visible-xs"><strong>{{t 'user_emailforward'}}</strong></div>
            <div class="col-sm-9">
            {{#if mail-forward}}
                {{#mail-forward}}
                    {{.}}<br>
                {{/mail-forward}}
            {{/if}}
            </div>
        </li>
    </ul>
</div>


<div class="pull-left">
    <a href="#/users/{{username}}/edit" class="btn btn-info slide visible-xs">
        <span class="fa-edit"></span> {{t 'user_username_edit' username}}
    </a>
</div>
<div class="pull-right">
    <a href="#/users/{{username}}/delete" class="btn btn-danger slide back">
        <span class="fa-trash-o"></span> {{t 'delete'}}
    </a>
</div>
