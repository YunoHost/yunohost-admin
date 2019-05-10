<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/apps">{{t 'applications'}}</a>
    <a href="#/apps/install">{{t 'install'}}</a>
    <a href="#/apps/install/{{id}}">{{manifest.name}}</a>
</div>

<div class="separator"></div>

<form action="#/apps" method="POST" class="form-horizontal form-app-install">

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-info-circle"></span> {{t 'infos'}}</h2>
    </div>
    <div class="panel-body">
        <dl class="dl-horizontal">
            <dt>{{t 'id'}}</dt>
            <dd>{{id}}</dd>
            <dt>{{t 'description'}}</dt>
            <dd>{{description}}</dd>
            <dt>{{t 'version'}}</dt>
            <dd>{{manifest.version}}</dd>
            <dt>{{t 'multi_instance'}}</dt>
            <dd>{{manifest.multi_instance}}</dd>
        </dl>
    </div>
</div>


<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-download"></span> {{t 'install'}}</h2>
    </div>
    <div class="panel-body">
        <div class="form-group">
            <label for="label" class="col-sm-12">{{t 'label_for_manifestname' manifest.name}}</label>
            <div class="col-sm-12">
                <input type="text" id="label" name="label" class="form-control" value="{{manifest.name}}" required>
            </div>
        </div>
        {{#manifest.arguments.install}}
        <div class="form-group">
            {{#if isDisplayText}}
            <div class="col-sm-12">
                {{#label}}
                <p>{{.}}</p>
                {{/label}}
            </div>
            {{else}}
            <label for="{{name}}" class="col-sm-12">{{label}}</label>


            {{#if helpText}}
            <span class="help-block help-block--help col-sm-12">{{{helpText}}}</span>
            {{/if}}

            <div class="col-sm-12">
                {{#if isPassword}}
                <p class="text-warning">{{t 'good_practices_about_admin_password'}}</p>
                {{/if}}

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
            {{/if}}
        </div>
        {{/manifest.arguments.install}}
        <hr>
        <input type="hidden" name="app" value="{{id}}">
        <div class="text-center">
            <input type="submit" role="button" class="btn btn-success slide back" value="{{t 'install'}}">
        </div>
    </div>
</div>

</form>
