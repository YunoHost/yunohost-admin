<div class="pull-left">
    <a href="#/users" class="btn btn-default slide back">
        <span class="fa-chevron-left"></span> {{t 'users_list'}}
    </a>
</div>
<div class="pull-right">
    <a href="#/users/{{username}}/edit" class="btn btn-info slide">
        <span class="fa-edit"></span> {{t 'user_username_edit' username}}
    </a>
</div>
<div class="clearfix"></div>
<h1 class="view-title">{{username}}</h1>

<div class="br"></div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-user"></span> {{fullname}}</h2>
    </div>
    <div class="panel-body">
        <dl class="dl-horizontal">
        <div class="row">
            <div class="col-sm-3 text-right hidden-xs"><strong>{{t 'user_username'}}</strong></div>
            <div class="col-sm-3 visible-xs"><strong>{{t 'user_username'}}</strong></div>
            <div class="col-sm-9"> {{username}}</div>
        </div>
        <div class="row">
            <div class="col-sm-3 text-right hidden-xs"><strong>{{t 'user_email'}}</strong></div>
            <div class="col-sm-3 visible-xs"><strong>{{t 'user_email'}}</strong></div>
            <div class="col-sm-9"> {{mail}}</div>
        </div>
        <div class="row">
            <div class="col-sm-3 text-right hidden-xs"><strong>{{t 'user_emailaliases'}}</strong></div>
            <div class="col-sm-3 visible-xs"><strong>{{t 'user_emailaliases'}}</strong></div>
            <div class="col-sm-9">
            {{#if mail-aliases}}
                {{#mail-aliases}}
                    {{.}}<br>
                {{/mail-aliases}}
            {{/if}}
            </div>
        </div>
        <div class="row">
            <div class="col-sm-3 text-right hidden-xs"><strong>{{t 'user_emailforward'}}</strong></div>
            <div class="col-sm-3 visible-xs"><strong>{{t 'user_emailforward'}}</strong></div>
            <div class="col-sm-9">
            {{#if mail-forward}}
                {{#mail-forward}}
                    {{.}}<br>
                {{/mail-forward}}
            {{/if}}
            </div>
        </div>
        </dl>
    </div>
</div>

<div class="text-center">
    <a href="#/users/{{username}}/delete" class="btn btn-danger slide back">
        <span class="fa-trash-o"></span> {{t 'delete'}}
    </a>
</div>
