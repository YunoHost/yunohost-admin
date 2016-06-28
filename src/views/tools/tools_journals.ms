<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/tools">{{t 'tools'}}</a>
    <a href="#/tools/journals">{{t 'journals'}}</a>
</div>

<div class="separator"></div>

{{#if data}}
{{#data}}
{{#categories}}
<div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
    <div class="panel panel-default">
        <div class="panel-heading" role="tab" id="heading-{{ name }}">
            <h2 class="panel-title">
                <a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse-{{ name }}" aria-expanded="true" aria-controls="collapse-{{ name }}">
                    <span class="fa-fw fa-info-circle"></span>{{ name }}
                </a>
            </h2>
        </div>
        <div id="collapse-{{ name }}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading-{{ name }}">
            <div class="list-group">{{#journals}}
                <a href="#/tools/journals/{{ file_name }}" class="list-group-item"><small>{{ started_at }}</small> {{ name }}</a>
            {{/journals}}</div>
            </div>
    </div>
</div>
{{/categories}}
{{/data}}
{{/if}}
