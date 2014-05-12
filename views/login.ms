<div class="page-header clearfix visible-xs">
    <h1 class="pull-left">YunoHost <small>Administration</small></h1>
</div>

<form action="#/login" id="form" method="post">
    <div class="input-group {{#domain}} hidden {{/domain}}">
        <label for="domain" class="input-group-addon">
            <span class="fa-fw fa-cloud"></span>
            <span class="sr-only">{{t 'domain'}}</span>
        </label>
        <input type="{{#if domain}}hidden{{else}}text{{/if}}" id="domain" name="domain" class="form-control" placeholder="{{t 'myserver_org'}}" value="{{domain}}">
    </div>
    <br />
    <div class="input-group">
        <label for="password" class="input-group-addon">
            <span class="fa-fw fa-lock"></span>
            <span class="sr-only">{{t 'password'}}</span>
        </label>
        <input type="password" id="password" name="password" class="form-control" placeholder="{{t 'administration_password'}}">
    </div>
    <br />
    <input id="submit" type="submit" value="{{t 'login'}}" class="btn btn-success pull-right" />
</form>
