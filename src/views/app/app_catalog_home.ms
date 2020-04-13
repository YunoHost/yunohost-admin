<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/apps">{{t 'applications'}}</a>
    <a href="#/apps/catalog">{{t 'catalog'}}</a>
</div>

<div class="separator"></div>

<div id="category-selector" class="list-group grid">
  <a class="app-category-card" href="#/apps/catalog/all">
        <div class="panel-body">
            <h2 class="app-category-title" style="padding-top: 3em'"><span class="fa-fw fa-search"></span> {{t 'all_apps'}}</h2>
        </div>
  </a>
  {{#categories}}
  <a class="app-category-card panel panel-default" href="#/apps/catalog/{{id}}">
        <div class="panel-body">
            <h2 class="app-category-title"><span class="fa-fw fa-{{icon}}"></span> {{title}}</h2>
            <h3 class="app-category-card-desc">{{description}}</h3>
        </div>
  </a>
  {{/categories}}
</div>
