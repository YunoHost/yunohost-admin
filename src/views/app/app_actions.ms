<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/apps">{{t 'applications'}}</a>
    <a href="#/apps/{{app}}">{{app_name}}</a>
    <a href="#/apps/{{app}}/actions">{{t 'app_actions'}}</a>
</div>

<div class="separator"></div>

<div class="alert alert-warning" role="alert">{{t 'experimental_warning'}}</div>

{{#if actions}}
{{#actions}}
<form action="#/apps/{{../app}}/actions/{{id}}" method="PUT" class="form-horizontal form-app-install">
<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title">{{name}}</h2>
    </div>
    <div class="panel-body">
        <p>{{description}}</p>
        {{#if arguments}}
        {{#arguments}}
        <div class="form-group">
            <label for="{{name}}" class="col-sm-12">{{label}}</label>

            {{#if helpText}}
            <span class="help-block help-block--help col-sm-12">{{{helpText}}}</span>
            {{/if}}

            <div class="col-sm-12">

                {{#if choices}}
                <select id="{{name}}" name="{{name}}" required class="form-control" {{{attributes}}}>
                    {{#choices}}<option value="{{value}}" {{#if selected}}selected{{/if}}>{{label}}</option>{{/choices}}
                </select>
                {{else}}
                <input type="{{inputType}}" id="{{name}}" name="{{name}}" class="form-control" value="{{default}}" placeholder="{{example}}" {{required}} {{{attributes}}}>
                {{/if}}

                {{#if helpLink}}
                <span class="help-block help-block--link">{{{helpLink}}}</span>
                {{/if}}

                {{#if example}}
                <span class="help-block help-block--example">{{t 'form_input_example' example}}</span>
                {{/if}}

            </div>
        </div>
        {{/arguments}}
        <hr>
        {{/if}}
        <input type="hidden" name="app" value="{{id}}">
        <div class="text-center">
            <input type="submit" class="btn btn-success slide back" value="{{t 'perform'}}">
        </div>
    </div>
</div>
</form>

{{/actions}}

{{else}}
<div class="alert alert-warning">
    <span class="fa-exclamation-triangle"></span>
    {{t 'app_no_actions'}}
</div>
{{/if}}
