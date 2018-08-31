<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/diagnosis">{{t 'diagnosis'}}</a>
</div>

<div class="separator"></div>

{{#reports}}
<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title" style="display: inline-block">{{ description }}</h2>
	<a href="#" role="button" class="btn btn-sm btn-info pull-right"><span class="fa-fw fa-refresh"></span> {{t 'recheck'}}</a>
    </div>
    <div class="panel-body">
	<ul class="list-group">
		<p>Last time ran : {{formatRelative time}}</p>
		{{#reports}}
		<li class="list-group-item alert alert-{{report.[0]}} alert-{{report.[0]}}-yo clearfix">
			{{#if icon}}
			<span class="fa-fw fa-{{icon}}"></span>
                        {{/if}}
			{{report.[1]}}
			{{#if issue}}
			<a href="#" role="button" class="btn btn-sm btn-warning pull-right" style="margin: -5px 5px"><span class="fa-fw fa-times"></span> {{t 'ignore'}}</a>
			<a href="#" role="button" class="btn btn-sm btn-default pull-right" style="margin: -5px 5px"><span class="fa-fw fa-level-down"></span>{{t 'details'}}</a>
			{{/if}}

		</li>
		{{/reports}}
	</ul>
    </div>
</div>
{{/reports}}
