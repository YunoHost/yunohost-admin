<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/services">{{t 'services'}}</a>
</div>

<div class="separator"></div>

<div class="list-group">
{{#services}}
    <a href="#/services/{{name}}" class="list-group-item slide service-{{name}}">
        <span class="fa-chevron-right pull-right"></span>
        <h2 class="list-group-item-heading">{{name}} <small>{{description}}</small></h2>
        <div class="list-group-item-text">
            {{#if (or (eq status "running") (eq status "active"))}}
                <span class="text-success">
                    <span class="fa-fw fa-check-circle"></span>
            {{else}}
                <span class="text-danger">
                    <span class="fa-fw fa-times"></span>
            {{/if}}
                    {{t status}}
                </span>
                {{t 'since'}} {{formatRelative last_state_change day="numeric" month="long" year="numeric" hour="numeric" minute="numeric" }}
        </div>
    </a>
{{/services}}
</div>
