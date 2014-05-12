<header class="page-header clearfix visible-xs">
    <h1 class="app title">YunoHost <span class="desc">Administration</span></h1>
    <span class="logout-button" role="button"><a class="fa-sign-out" href="#/logout" title="{{t 'logout'}}"><span class="sr-only">{{t 'logout'}}</span></a></span>
</header>

<div class="list-group">
{{#links}}
	<a href="{{path}}" class="list-group-item slide clearfix">
        <span class="pull-right fa-chevron-right"></span>
        <h2 class="list-group-item-heading">{{name}}</h2>
	</a>
{{/links}}
</div>

