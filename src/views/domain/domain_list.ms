<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/domains">{{t 'domains'}}</a>
</div>

<div class="actions-group">
    <a role="button" href="#/domains/add" class="btn btn-success slide">
        <span class="fa-plus"></span> {{t 'domain_add'}}
    </a>
</div>

<div class="separator"></div>

<div class="list-group">
    {{#each domains}}
    <a href="#/domains/{{url}}" class="list-group-item slide clearfix">
        <span class="pull-right fa-chevron-right"></span>
        <h2 class="list-group-item-heading">
            {{url}}
            {{#if main}}<small><span class="fa-star" title="{{t 'default'}}"></span></small>{{/if}}
        </h2>
        <p class="list-group-item-text">https://{{url}}</p>
    </a>
    {{/each}}
</div>
