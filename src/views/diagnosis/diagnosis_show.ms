<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/diagnosis">{{t 'diagnosis'}}</a>
</div>

<div class="separator"></div>

{{#reports}}
<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title">{{ description }}</h2>
    </div>
    <div class="panel-body">
	<ul class="list-group">
		{{#reports}}
		<li class="list-group-item alert alert-{{report.[0]}} alert-{{report.[0]}}-yo">
			{{#if report.[2]}}
			<span class="fa-fw fa-{{report.[2]}}"></span>
                        {{/if}}
			{{report.[1]}}
		</li>
		{{/reports}}
	</ul>
    </div>
</div>
{{/reports}}
