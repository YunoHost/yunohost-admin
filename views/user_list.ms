<div class="panel panel-default">
    <div class="panel-heading">
        <h1 class="panel-title">Users</h1>
    </div>
    <div class="list-group">
    {{#Users}}
        <a href="#/users/{{Username}}" class="list-group-item slide">
            <h4 class="pull-left list-group-item-heading">{{Fullname}}</h4>
            <span class="glyphicon glyphicon-chevron-right pull-right"></span>
            <div class="clearfix"></div>
        </a>
    {{/Users}}
    </div>
</div>
