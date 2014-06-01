<div class="pull-left">
    <a href="#/apps/install" class="btn btn-default slide back">
        <span class="fa-chevron-left"></span> {{t 'app_list'}}
    </a>
</div>
<div class="clearfix"></div>
<h1 class="view-title">{{t 'install_name' manifest.name}}</h1>

<div class="br"></div>

<form action="#/apps" method="POST" class="form-horizontal">

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-info-circle"></span> {{t 'infos'}}</h2>
    </div>
    <div class="panel-body">
        <dl class="dl-horizontal">
            <dt>{{t 'id'}}</dt>
            <dd>{{manifest.id}}</dd>
            <dt>{{t 'description'}}</dt>
            <dd>{{description}}</dd>
            <dt>{{t 'multi_instance'}}</dt>
            <dd>{{#if manifest.multi_instance}}{{t 'yes'}}{{else}}{{t 'no'}}{{/if}}</dd>
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
                <input type="text" name="label" class="form-control" value="{{manifest.name}}" required>
            </div>
        </div>
        {{#manifest.arguments.install}} 
        <div class="form-group">
            <label for="{{name}}" class="col-sm-12">{{ask.en}}</label>
            <div class="col-sm-12">
                {{#if allowedValues}}
                <select name="{{name}}" required placeholder="{{example}}" class="form-control" {{#if multipleValues}}multiple{{/if}}>
                    <option value="" default disabled selected>{{example}}</option>
                    {{#allowedValues}}<option value="{{value}}">{{label}}</option>{{/allowedValues}}
                </select>
                {{else}}
                    {{#if choices}}
                        {{#each choices}}
                        <div class="radio">
                        <label for="{{../name}}-{{key}}">
                            <input type="radio" id="{{../name}}-{{key}}" name="{{../name}}" value="{{value}}" {{#if checked}}checked{{/if}} required> {{value}}
                        </label>
                        </div>
                        {{/each}}
                    {{else}}
                    <input type="text" name="{{name}}" class="form-control" value="{{default}}" placeholder="{{example}}" required>
                    {{/if}}
                {{/if}}

                {{#if help}}
                <span class="help-block">{{{help}}}</span>
                {{/if}}
            </div>
        </div>
        {{/manifest.arguments.install}}
        <hr>
        <input type="hidden" name="app" value="{{manifest.id}}">
        <div class="text-center">
            <input type="submit" class="btn btn-success slide back" value="{{t 'install'}}">
        </div>
    </div>
</div>

</form>
