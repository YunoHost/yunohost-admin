<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/apps">{{t 'applications'}}</a>
    <a href="#/apps/install">{{t 'install'}}</a>
    <a href="#/apps/install/{{id}}">{{manifest.name}}</a>
</div>

<div class="separator"></div>

<form action="#/apps" method="POST" class="form-horizontal">

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
            <label for="{{name}}" class="col-sm-12">{{label}}</label>
            <div class="col-sm-12">

                {{#if choices}}
                <select id="{{name}}" name="{{name}}" required class="form-control">
                    {{#choices}}<option value="{{value}}" {{#if selected}}selected{{/if}}>{{label}}</option>{{/choices}}
                </select>
                {{else}}
                <input type="{{inputType}}" id="{{name}}" name="{{name}}" class="form-control" value="{{default}}" placeholder="{{example}}" {{required}}>
                {{/if}}

                {{#if help}}
                <span class="help-block">{{{help}}}</span>
                {{/if}}
            </div>
        </div>
        {{/manifest.arguments.install}}
        <hr>
        <input type="hidden" name="app" value="{{id}}">
        <div class="text-center">
            <input type="submit" class="btn btn-success slide back" value="{{t 'install'}}">
        </div>
    </div>
</div>

</form>
