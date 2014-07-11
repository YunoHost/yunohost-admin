<div class="container pull-left">
    <div class="row">
        <div id="bc1" class="btn-group btn-breadcrumb">
            <a href="#/" class="btn btn-default"><i class="fa fa-home"></i></a>
            <a href="#/users" class="btn btn-default visible-xs"><div>...</div></a>
            <a href="#/users" class="btn btn-default hidden-xs"><div>{{t 'users'}}</div></a>
            <a href="#/users/{{username}}" class="btn btn-default"><div>{{username}}</div></a>
            <a href="#/users/{{username}}/edit" class="btn btn-default"><div>{{t 'user_username_edit' username}}</div></a>
        </div>
    </div>
</div>
<div class="clearfix"></div>

<div class="br"></div>

<form action="#/users/{{username}}" method="PUT" class="form-horizontal">

<div class="panel panel-default">
    <div class="panel-body">
        <div class="form-group">
            <label for="username" class="col-sm-3 control-label">{{t 'user_username'}}</label>
            <div class="col-sm-9">
                <input type="text" id="username" name="username" class="form-control" placeholder="{{username}}" disabled>
            </div>
        </div>
        <div class="form-group">
            <label for="firstname" class="col-sm-3 control-label">{{t 'user_fullname'}}</label>
            <div class="clearfix visible-xs"></div>
            <div class="col-sm-4 col-xs-6">
                <input type="text" id="firstname" name="firstname" class="form-control" placeholder="{{firstname}}">
            </div>
            <div class="col-sm-5 col-xs-6">
                <input type="text" name="lastname" class="form-control" placeholder="{{lastname}}">
            </div>
        </div>
        <div class="form-group">
            <label for="email" class="col-sm-3 control-label">{{t 'user_email'}}</label>
            <div class="clearfix visible-xs"></div>
            <input type="hidden" id="mail" name="mail" class="form-control" value="{{mail}}">
            <div class="col-sm-4 col-xs-6">
                <input type="text" id="email" name="email" class="form-control" placeholder="{{email.username}}" value="{{email.username}}">
            </div>
            <div class="col-sm-5 col-xs-6">
               <select class="form-control" name="domain">
                   {{#domains}}
                       <option {{#if selected}}selected="selected"{{/if}}>@{{domain}}</option>
                   {{/domains}}
               </select>
            </div>

        </div>
        <hr>
        <div class="form-group">
            <label for="password" class="col-sm-3 control-label">{{t 'password'}}</label>
            <div class="col-sm-9">
                <input type="password" id="password" name="password" class="form-control" placeholder="•••••">
            </div>
        </div>
        <div class="form-group">
            <label for="confirmation" class="col-sm-3 control-label">{{t 'password_confirmation'}}</label>
            <div class="col-sm-9">
                <input type="password" id="confirmation" name="confirmation" class="form-control" placeholder="•••••">
                <div class="help-block">{{t 'password_description'}}</div>
            </div>
        </div>
    </div>
</div>

<div class="text-center">
    <input type="submit" class="btn btn-success slide back" value="{{t 'save'}}">
</div>

</form>
