<div class="pull-left">
    <a href="#/" class="btn btn-default slide back">
    	<span class="fa-chevron-left"></span> {{t 'menu'}}
    </a>
</div>
<div class="clearfix"></div>
<h1 class="view-title">{{t 'tools'}}</h1>
<div class="br"></div>


<div class="list-group">
{{#links}}
    <a href="{{path}}" class="list-group-item slide">
        <span class="fa-chevron-right pull-right"></span>
        <h2 class="list-group-item-heading">{{name}}</h2>
    </a>
{{/links}}
</div>

