<div class="pull-left">
    <a href="#/" class="btn btn-default slide back"><span class="glyphicon glyphicon-chevron-left"></span> Menu</a>
</div>
<div class="pull-right">
    <a href="#/users/create" class="btn btn-success slide"><span class="glyphicon glyphicon-plus"></span> New user</a>
</div>
<div class="clearfix"></div>
<div class="view-title">Users</div>
<div class="br"></div>

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
