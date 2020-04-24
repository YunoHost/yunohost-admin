<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/apps" class="hidden-xs">{{t 'applications'}}</a>
    <a href="#/apps" class="visible-xs">&hellip;</a>
    <a href="#/apps/{{id}}">{{label}}</a>
    <a href="#/apps/{{id}}/changelabel">{{t 'app_change_label'}}</a>
</div>

<div class="separator"></div>


<form action="#/apps/{{id}}/changelabel" method="POST" class="form-horizontal form-app-install">

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-tag"></span> {{t 'app_manage_label'}}</h2>
    </div>
    <div class="panel-body">
        {{#each permissions}}
            <div class="row">
                <div class="col-sm-2">
                    <h3>{{title}}</h3>
                </div>
                <div class="col-sm-8">
                    {{#if tile_available}}
                        <p>Permission url: <a href=https://{{url}}>https://{{url}}</a></p>
                    {{/if}}
                    <input type="text" id="label" name="label_{{name}}" class="form-control" value="{{label}}" required="required">
                </div>
                {{#if tile_available}}
                    <div class="col-sm-2">
                        <p>{{t 'show_tile_enabled'}}</p>
                        <input type="checkbox" id="show_tile_{{name}}" name="show_tile_{{name}}" value="{{name}}" {{#if show_tile}} checked {{/if}} class="nice-checkbox">
                        <label for="show_tile_{{name}}" class="pull-right"><span class="sr-only">{{t 'check'}}</span></label>
                    </div>
                {{/if}}
            </div>
            <hr />
        {{/each}}
    <div class="text-center">
        <input type="submit" role="button" class="btn btn-success slide back" value="{{t 'app_change_label'}}">
    </div>
    </div>
</div>

</form>
