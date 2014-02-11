<div class="page-header clearfix visible-xs">
    <h1 class="pull-left">YunoHost <small>Administration</small></h1>
</div>

<form action="#/login" id="form" method="post">
    <div class="input-group {{#domain}} hidden{{/domain}}">
        <span class="input-group-addon"> <span class="glyphicon glyphicon-cloud"></span> </span>
        <input type="{{#if domain}}hidden{{else}}text{{/if}}" name="domain" class="form-control" placeholder="myserver.org" value="{{domain}}">
    </div>
    <br />
    <div class="input-group">
        <span class="input-group-addon"><span class="glyphicon glyphicon-lock"></span> </span>
        <input type="password" name="password" class="form-control" placeholder="Admin password">
    </div>
    <br />
    <input id="submit" type="submit" value="Login" class="btn btn-success pull-right"/>
</form>
