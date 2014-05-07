<header class="page-header clearfix visible-xs">
    <h1 class="app title">YunoHost <span class="desc">Administration</span></h1>
    <span class="logout-button" role="button"><a class="fa-sign-out" href="#/logout" title="Logout"><span class="sr-only">Logout</span></a></span>
</header>

<div class="list-group">
{{#links}}
	<a href="{{path}}" class="list-group-item slide clearfix">
        <h4 class="pull-left list-group-item-heading">{{name}}</h4>
        <span class="pull-right fa-chevron-right"></span>
	</a>
{{/links}}
</div>

