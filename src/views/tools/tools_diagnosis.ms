<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/tools">{{t 'tools'}}</a>
    <a href="#/tools/diagnosis">{{t 'diagnosis'}}</a>
    {{#private}}
    <a href="#/tools/diagnosis/private">{{t 'diagnosis_with_private'}}</a>
    {{/private}}
</div>

<div class="separator"></div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-stethoscope"></span> {{t 'diagnosis'}}</h2>
    </div>
    <div class="panel-body">
        <pre id="diagnosis">{{ diagnosis }}</pre>
        {{#if private}}
        <a class="btn btn-primary" href="#/tools/diagnosis">{{t 'diagnosis_hide_private'}}</a>
        {{else}}
        <a class="btn btn-primary" href="#/tools/diagnosis/private">{{t 'diagnosis_view_private'}}</a>
        {{/if}}
        <button data-paste-content="#diagnosis"><i class="fa-cloud-upload"></i> {{t 'upload'}}</button>
    </div>
</div>
