<div class="pull-left">
    <a href="#/" class="btn btn-default slide back">
        <span class="fa-chevron-left"></span> Menu
    </a>
</div>
<div class="clearfix"></div>
<h1 class="view-title">Services</h1>
<div class="br"></div>

<div class="list-group">
{{#services}}
    <a href="#/services/{{name}}" class="list-group-item slide service-{{name}}">
        <span class="fa-chevron-right pull-right"></span>
        <h2 class="list-group-item-heading">{{name}}</h2>
        <div class="list-group-item-text">
            Status: 
            <span class="text-{{#is_running}}success{{/is_running}}{{^is_running}}danger{{/is_running}}">
            {{status}}
            </span>
        </div>
	</a>
{{/services}}
</div>