<div class="container pull-left">
    <div class="row">
        <div id="bc1" class="btn-group btn-breadcrumb">
            <a href="#/" class="btn btn-default"><i class="fa fa-home"></i></a>
            <a href="#/tools" class="btn btn-default"><div>{{t 'tools'}}</div></a>
            <a href="#/tools/update" class="btn btn-default"><div>{{t 'system_update'}}</div></a>
            <a href="#/tools/upgrade" class="btn btn-default"><div>{{t 'system_upgrade'}}</div></a>
        </div>
    </div>
</div>
<div class="clearfix"></div>
<h1 class="view-title">{{t 'system_upgrade'}}</h1>
<div class="br"></div>

{{#if logs}}
<pre class="upgrade-log log">
{{#logs}}
    {{.}}
{{/logs}}
</pre>
{{else}}
        {{t 'no_log'}}
{{/if}}
