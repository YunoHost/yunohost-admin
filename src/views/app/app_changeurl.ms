<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/apps" class="hidden-xs">{{t 'applications'}}</a>
    <a href="#/apps" class="visible-xs">&hellip;</a>
    <a href="#/apps/{{id}}">{{label}}</a>
    <a href="#/apps/{{id}}/changeurl">{{t 'app_change_url'}}</a>
</div>

<div class="separator"></div>

<form action="#/apps/{{id}}/changeurl" method="POST" class="form-horizontal form-app-install">
    <div class="panel panel-default">
        <div class="panel-heading">
            <h2 class="panel-title"><span class="fa-fw fa-exchange"></span> {{t 'app_change_url'}}</h2>
        </div>
        <div class="panel-body">
            <div class="form-group">
                <label for="domain" class="col-sm-12">{{t 'domain'}}</label>
                    <div class="col-sm-12">
                    <select id="domain" name="domain" required class="form-control" {{{attributes}}}>
                            {{#each domains}}<option value="{{this.value}}" {{#if selected}}selected{{/if}}>{{this.label}}</option>{{/each}}
                    </select>
                    <span class="help-block help-block--link"><a href='#/domains'>{{t 'manage_domains'}}</a></span>
                </div>
                
                <label for="path" class="col-sm-12">{{t 'path_url'}}</label>
                <div class="col-sm-12">
                    <input class="col-sm-12" type="text" id="path" name="path" class="form-control" value="{{path}}" required="required">
                </div>
            </div>
            <hr>
            <input type="hidden" name="app" value="{{id}}">
            <div class="text-center">
                <input type="submit" class="btn btn-success slide back" value="{{t 'app_change_url'}}">
            </div>
        </div>
    </div>
</form>
