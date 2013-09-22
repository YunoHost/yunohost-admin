<div class="panel panel-default">
    <div class="panel-heading">
        <h1 class="panel-title">Users</h1>
    </div>
    <div class="list-group">
    {{#Users}}
        <a href="#/users/{{Username}}" class="list-group-item slide">
            <h4 class="pull-left list-group-item-heading">{{Username}} <small>{{Fullname}}</small></h4>
            <span class="glyphicon glyphicon-chevron-right pull-right"></span>
            <div class="clearfix"></div>
            <p class="list-group-item-text">{{Mail}}</p>
        </a>
    {{/Users}}
    </div>
</div>
