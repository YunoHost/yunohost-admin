<div class="pull-left">
    <a href="#/" class="btn btn-default slide back">
        <span class="fa-chevron-left"></span> {{t 'menu'}}
    </a>
</div>
<div class="pull-right">
    <a href="#/domains/add" class="btn btn-success slide">
        <span class="fa-plus"></span> {{t 'domain_add'}}
    </a>
</div>
<div class="clearfix"></div>
<h1 class="view-title">{{t 'domains'}}</h1>
<div class="br"></div>

<div class="list-group">
	{{#domains}}
	<div class="list-group-item">
        {{#if main}}
        <span class="container text-success pull-right">
            <span class="fa-star"></span> {{t 'default'}}
        </span>
        {{else}}
        <a href="#/domains/{{url}}/delete" class="btn btn-danger slide back pull-right">
            <span class="fa-trash-o"></span> {{t 'delete'}}
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
            {{t 'domain_default'}}
        </h2>
    </div>
    <div class="panel-body">
        <p>{{t 'domain_default_desc'}}</p>
        <form method="POST" action="#/domains" class="row">
            <div class="col-xs-9 col-sm-6">
                <select name="domain" required class="form-control">
                    <option value="" default disabled selected>{{t 'domain_select'}}</option>
                    {{#domains}}{{#unless main}}<option value="{{url}}">{{url}}</option>{{/unless}}{{/domains}}
                </select>
            </div>
            <div class="col-xs-3 col-sm-6">
                <input type="submit" class="btn btn-success slide back" value="{{t 'set_default'}}">
            </div>
        </form>

    </div>
</div>
