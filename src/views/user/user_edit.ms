<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/users" class="visible-xs">&hellip;</a>
    <a href="#/users" class="hidden-xs">{{t 'users'}}</a>
    <a href="#/users/{{username}}">{{username}}</a>
    <a href="#/users/{{username}}/edit">{{t 'user_username_edit' username}}</a>
</div>

<div class="separator"></div>

<form action="#/users/{{username}}" method="PUT" class="form-horizontal">

<div class="panel panel-default">
    <div class="panel-body">
        <div class="form-group">
            <label for="username" class="col-sm-3 control-label">{{t 'user_username'}}</label>
            <div class="col-sm-9">
                <input type="text" id="username" name="username" class="form-control" value="{{username}}" disabled>
            </div>
        </div>
        <div class="form-group">
            <label for="firstname" class="col-sm-3 control-label">{{t 'user_fullname'}}</label>
            <div class="clearfix visible-xs"></div>
            <div class="col-sm-4 col-xs-6">
                <input type="text" id="firstname" name="firstname" class="form-control" value="{{firstname}}">
            </div>
            <div class="col-sm-5 col-xs-6">
                <input type="text" name="lastname" class="form-control" value="{{lastname}}">
            </div>
        </div>
        <div class="form-group">
            <label for="email" class="col-sm-3 control-label">{{t 'user_email'}}</label>
            <div class="clearfix visible-xs"></div>
            <input type="hidden" id="mail" name="mail" class="form-control" value="{{mail}}">
            <div class="col-sm-4 col-xs-6">
                <input type="text" id="email" name="email" class="form-control" value="{{email.username}}">
            </div>
            <div class="col-sm-5 col-xs-6">
               <select class="form-control" name="domain">
                   {{#domains}}
                       <option {{#if selected}}selected="selected"{{/if}}>@{{domain}}</option>
                   {{/domains}}
               </select>
            </div>
        </div>
        <div class="form-group">
            <label for="mailbox-quota" class="col-sm-3 control-label">{{t 'user_mailbox_quota'}}</label>
            <div class="col-sm-4">
                <div class="input-group">
                    <input type="number" min="0" id="mailbox-quota" name="mailbox_quota" class="form-control" value="{{quota}}" placeholder="{{t 'mailbox_quota_placeholder'}}">
                    <div class="input-group-addon">M</div>
                </div>
            </div>
            <div class="col-sm-5">
                <div class="help-block quota-help-block">{{t 'mailbox_quota_description'}}</div>
            </div>
        </div>

        <hr>
        <div class="form-group">
            <label for="mailalias" class="col-sm-3 control-label">{{t 'user_emailaliases'}}</label>
            <div class="col-sm-9">
            {{#mail-aliases}}
            <input type="email" name="mailalias" class="form-control" value="{{.}}" style="margin-bottom: 5px;">
            {{/mail-aliases}}
            <input id="mailalias" type="email" name="mailalias" class="mailalias-input form-control" placeholder="{{t 'user_new_mail'}}">
            </div>
        </div>

        <hr>
        <div class="form-group">
            <label for="mailforward" class="col-sm-3 control-label">{{t 'user_emailforward'}}</label>
            <div class="col-sm-9">
            {{#mail-forward}}
            <input type="email" name="mailforward" class="form-control" value="{{.}}" style="margin-bottom: 5px;">
            {{/mail-forward}}
            <input id="mailforward" type="email" name="mailforward" class="mailforward-input form-control" placeholder="{{t 'user_new_forward'}}">
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
                <div class="help-block">{{t 'good_practices_about_user_password'}}</div>
            </div>
        </div>

    </div>
</div>

<div class="text-center">
    <input type="submit" role="button" class="btn btn-success slide back" value="{{t 'save'}}">
</div>

</form>
