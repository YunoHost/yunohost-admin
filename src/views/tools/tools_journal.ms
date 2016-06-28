{{#journal}}
<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/tools">{{t 'tools'}}</a>
    <a href="#/tools/journals">{{t 'journals'}}</a>
    <a href="#/tools/journals/" + {{ file_name }}>{{ name }} - {{ started_at }}</a>
</div>

<div class="separator"></div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-info-circle"></span> {{ name }}</h2>
    </div>
    <div class="panel-body">
        <dl class="dl-horizontal">
            <dt>{{t 'started_at'}}</dt> <dd>{{ started_at }}</dd>
            <dt>{{t 'path'}}</dt> <dd>{{ path }}</dd>
            {{#each metadata}}
            <dt>{{@key}}</dt>
            <dd>{{.}}</dd>
            {{/each}}
        </dl>
    </div>
</div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-file-text"></span> {{t 'logs'}}</h2>
    </div>
    <div class="panel-body overflow-auto">
        <table>
            <tr>
                <td> <!-- no indent because pre is sensible to whitespaces -->
<pre>{{#logs}}{{datetime}}
{{/logs}}</pre>
                </td>
                <td class="full-width"> <!-- no indent because pre is sensible to whitespaces -->
<pre class="full-width">{{#logs}}{{{line}}}
{{/logs}}</pre>
                </td>
            </tr>
        </table>
    </div>
</div>
{{/journal}}
