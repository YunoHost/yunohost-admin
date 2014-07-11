<div class="container pull-left">
    <div class="row">
        <div id="bc1" class="btn-group btn-breadcrumb">
            <a href="#/" class="btn btn-default"><i class="fa fa-home"></i></a>
            <a href="#/services" class="btn btn-default"><div>{{t 'services'}}</div></a>
        </div>
    </div>
</div>
<div class="clearfix"></div>
<div class="br"></div>

<div class="list-group">
{{#services}}
    <a href="#/services/{{name}}" class="list-group-item slide service-{{name}}">
        <span class="fa-chevron-right pull-right"></span>
        <h2 class="list-group-item-heading">{{name}}</h2>
        <div class="list-group-item-text">
            {{t 'service_status'}}
            <span class="text-{{#is_running}}success{{/is_running}}{{^is_running}}danger{{/is_running}}">
            {{status}}
            </span>
        </div>
	</a>
{{/services}}
</div>
