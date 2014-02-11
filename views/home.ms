<div class="page-header clearfix visible-xs">
    <a href="#/logout" class="pull-right logout-button">
        <span class="glyphicon glyphicon-log-out"></span><span class="text-hide">Logout</span>
    </a>
    <h1 class="pull-left">YunoHost <small>Administration</small></h1>
</div>

<div class="list-group">
{{#links}}
    <a href="{{path}}" class="list-group-item slide">
        <h4 class="pull-left list-group-item-heading">{{name}}</h4>
        <span class="glyphicon glyphicon-chevron-right pull-right"></span>
        <div class="clearfix"></div>
    </a>
{{/links}}
</div>

