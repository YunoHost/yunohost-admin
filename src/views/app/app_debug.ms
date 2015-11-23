<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/apps">{{t 'applications'}}</a>
    <a href="#/apps/{{name}}">{{label}}</a>
    <a href="#/apps/{{name}}/debug">{{t 'debug'}}</a>
</div>

<div class="separator"></div>

{{#if services}}
<div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
{{#services}}
    <div class="panel panel-default">
        <div class="panel-heading" role="tab" id="heading-{{ @index }}">
            <h2 class="panel-title">
                <a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse-{{ @index }}" aria-expanded="true" aria-controls="collapse-{{ @index }}">
                    <span class="fa-fw fa-info-circle"></span> {{t 'service_log' name }}
                </a>
            </h2>
        </div>
        <div id="collapse-{{ @index }}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading-{{ @index }}">
            <div class="panel-body">
            {{#logs}}
                <h3>{{file_name}}</h3>
                <pre class="service-log">{{file_content}}</pre>
            {{/logs}}
            </div>
        </div>
    </div>
{{/services}}
</div>

{{else}}
<div class="alert alert-warning">
    <span class="fa-exclamation-triangle"></span>
    {{t 'app_debug_no_logs'}}
</div>
{{/if}}
