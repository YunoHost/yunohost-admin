<div class="pull-left">
    <a href="#/" class="btn btn-default slide back"><span class="glyphicon glyphicon-chevron-left"></span> Menu</a>
</div>
<div class="clearfix"></div>
<div class="view-title">Services</div>
<div class="br"></div>

<div class="list-group">
{{#services}}
    <a href="#/services/{{name}}" class="list-group-item slide service-{{name}}">
        <span class="glyphicon glyphicon-chevron-right pull-right"></span>
        <h3 class="list-group-item-heading">{{name}}</h3>
        <div class="clearfix"></div>
        <div class="list-group-item-text">
            Status: 
            <span class="text-{{#is_running}}success{{/is_running}}{{^is_running}}danger{{/is_running}}">
            {{status}}
            </span>
        </div>
	</a>
{{/services}}
</div>