<div class="pull-left">
    <a href="#/" class="btn btn-default slide back"><span class="glyphicon glyphicon-chevron-left"></span> Menu</a>
</div>
<div class="pull-right">
    <a href="#/domains/add" class="btn btn-success slide"><span class="glyphicon glyphicon-plus"></span> Add domain</a>
</div>
<div class="clearfix"></div>
<div class="view-title">Domains</div>
<div class="br"></div>

<div class="list-group">
	{{#Domains}}
	<div class="list-group-item">
        <a href="#/domains/{{.}}/delete" class="btn btn-danger slide back pull-right">
            <span class="glyphicon glyphicon-trash"></span> Delete
        </a>
        <h2 class="list-group-item-heading">{{.}}</h2>
        <a href="https://{{.}}" target="_blank">https://{{.}}</a>
	</div>
	{{/Domains}}
</div>
