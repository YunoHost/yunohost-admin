<div class="pull-left">
    <a href="#/" class="btn btn-lg btn-default slide back"><span class="glyphicon glyphicon-chevron-left"></span> Menu</a>
</div>
<div class="pull-right">
    <a href="#/domains/add" class="btn btn-lg btn-success slide"><span class="glyphicon glyphicon-plus"></span> Add domain</a>
</div>
<div class="clearfix"></div>
<div class="view-title">Domains</div>
<div class="br"></div>

<div class="list-group">
{{#Domains}}
    <a href="#/domains/{{.}}" class="list-group-item slide">
        <h4 class="pull-left list-group-item-heading">{{.}}</h4>
        <span class="glyphicon glyphicon-chevron-right pull-right"></span>
        <div class="clearfix"></div>
    </a>
{{/Domains}}
</div>
