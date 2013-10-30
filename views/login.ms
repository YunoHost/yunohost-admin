<div class="page-header visible-xs">
    <h1 class="pull-left">YunoHost <small>Administration</small></h1>
    <div class="clearfix"></div>
    <br />
</div>

<form action="#/login" id="form" method="post">
    <div class="input-group"{{#domain}} style="display: none"{{/domain}}>
        <span class="input-group-addon"> <span class="glyphicon glyphicon-cloud"></span> </span>
        <input type="{{#domain}}hidden{{/domain}}{{^domain}}text{{/domain}}" name="domain" class="form-control" placeholder="myserver.org"{{#domain}} value="{{domain}}" {{/domain}}>
    </div>
    <br />
    <div class="input-group">
        <span class="input-group-addon"><span class="glyphicon glyphicon-lock"></span> </span>
        <input type="password" name="password" class="form-control" placeholder="Admin password">
    </div>
    <br />
    <input id="submit" type="submit" value="Login" class="btn btn-success pull-right"/>
</form>
