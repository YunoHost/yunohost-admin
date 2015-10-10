<div class="help" style="display: {{display_help}}">
    <h3>{{t 'Welcome to the domains panel'}}</h3>
    <p>Lorem ipsum dolorem trolololo ut</p>
</div>

<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/domains">{{t 'domains'}}</a>
</div>

<div class="actions-group">
    <a href="#/domains/add" class="btn btn-success slide">
        <span class="fa-plus"></span> {{t 'domain_add'}}
    </a>
</div>

<div class="separator"></div>

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

{{#if main_domain_form}}
<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title">
            {{t 'domain_default'}}
        </h2>
    </div>
    <div class="panel-body">
        <p>{{t 'domain_default_desc'}}</p>
        <form method="POST" action="#/domains" class="row">
            <div class="form-group col-sm-6">
                <select name="domain" required class="form-control">
                    <option value="" default disabled selected>{{t 'domain_select'}}</option>
                    {{#domains}}{{#unless main}}<option value="{{url}}">{{url}}</option>{{/unless}}{{/domains}}
                </select>
            </div>
            <div class="form-group col-sm-6">
                <input type="submit" class="btn btn-success slide back" value="{{t 'set_default'}}">
            </div>
        </form>

    </div>
</div>
{{/if}}