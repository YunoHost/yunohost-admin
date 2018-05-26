<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/tools">{{t 'tools'}}</a>
    <a href="#/tools/logs">{{t 'logs'}}</a>
</div>

<div class="separator"></div>

{{#if data}}
{{#data}}
<div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
    <div class="panel panel-default">
        <div class="panel-heading" role="tab" id="heading-uo">
            <h2 class="panel-title">
                <a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse-uo" aria-expanded="true" aria-controls="collapse-uo">
                    <span class="fa-fw fa-info-circle"></span>{{t 'unit_operation'}}
                </a>
            </h2>
        </div>
        <div id="collapse-uo" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading-uo">
            <div class="list-group">{{#operations}}
                <a href="#/tools/logs/{{ name }}" class="list-group-item"><small>{{ started_at }}</small> {{ name }}</a>
            {{/operations}}</div>
            </div>
    </div>
</div>
{{/data}}
{{/if}}
