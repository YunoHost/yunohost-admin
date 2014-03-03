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
	{{#domains}}
	<div class="list-group-item">
        {{#if main}}
        <span class="container text-success pull-right">
            <span class="glyphicon glyphicon-star"></span> Default
        </span>
        {{else}}
        <a href="#/domains/{{.}}/delete" class="btn btn-danger slide back pull-right">
            <span class="glyphicon glyphicon-trash"></span> Delete
        </a>
        {{/if}}
        <h2 class="list-group-item-heading">{{url}}</h2>
        <a href="https://{{url}}" target="_blank">https://{{url}}</a>
	</div>
	{{/domains}}
</div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title">
            Default domain
        </h2>
    </div>
    <div class="panel-body">
        <p>
        The default domain is the connection domain where users log in.
        </p>
        <form method="POST" action="#/domains" class="row">
            <div class="col-xs-9 col-sm-6">
                <select name="domain" required class="form-control">
                    <option value="" default disabled selected>Select domain</option>
                    {{#domains}}{{#unless main}}<option value="{{url}}">{{url}}</option>{{/unless}}{{/domains}}
                </select>
            </div>
            <div class="col-xs-3 col-sm-6">
                <input type="submit" class="btn btn-success slide back" value="Set default">
            </div>
        </form>

    </div>
</div>
