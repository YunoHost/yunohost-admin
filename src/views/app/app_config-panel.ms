<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/apps">{{t 'applications'}}</a>
    <a href="#/apps/{{app_id}}">{{app_name}}</a>
    <a href="#/apps/{{app_id}}/config-panel">{{t 'config-panel'}}</a>
</div>

<div class="separator"></div>

{{#if config_panel}}

<div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
{{#config_panel}}
<h2>{{../app_name}} configuration panel</h2>
<hr>
{{#panel}}
    <div class="panel panel-default">
        <div class="panel-heading" role="tab" id="heading-{{ @index }}">
            <h2 class="panel-title">
                <a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse-{{ @index }}" aria-expanded="true" aria-controls="collapse-{{ @index }}">
                    {{name}}
                <small>{{help}}</small>
                </a>
            </h2>
        </div>
        <div id="collapse-{{ @index }}" class="panel-collapse {{#if (neq @index 0)}}collapse{{/if}}" role="tabpanel" aria-labelledby="heading-{{ @index }}">
            <div class="panel-body">
            <form class="form-horizontal" action="#/apps/{{../../app_id}}/config" method="POST">
                {{#sections}}
                <div class="panel panel-default">
                    <div class="panel-heading"><h3 class="panel-title">{{name}} <small>{{help}}</small></h3></div>
                    <div class="panel-body">
                        <ul>
                        {{#options}}
                        <div class="form-group">
                            <label for="{{id}}" class="col-sm-2 control-label">{{name}}</label>
                            <div class="col-sm-10">
                            {{#if (in type "number" "text" "password" "color" "date" "datetime-local" "email" "month number" "range" "search" "tel" "time" "url" "week")}}
                                <input type="number" class="form-control" id="{{id}}" name="{{id}}" placeholder="{{placeholder}}">
                                <span class="help-block">{{ help }}</span>
                            {{else if (eq type "bool")}}
                            <input type="radio" name="{{id}}" value="true" {{#if value}}checked{{/if}}> yes
                            <input type="radio" name="{{id}}" value="false"{{#if (eq value false)}}checked{{/if}}> no
                            <span class="help-block">{{ help }}</span>
                            {{/if}}
                            </div>
                        </div>
                        {{/options}}
                        </ul></li>
                        </ul>
                    </div>
                </div>
                {{/sections}}

                <br>
                <div><button class="btn btn-primary" type="submit">Save</button></div>
            </form>
            </div>
        </div>
    </div>
{{/panel}}
{{/config_panel}}
</div>

{{else}}
<div class="alert alert-warning">
    <span class="fa-exclamation-triangle"></span>
    {{t 'app_config_panel_no_panel'}}
</div>
{{/if}}
