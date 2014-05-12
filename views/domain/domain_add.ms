<div class="pull-left">
    <a href="#/domains" class="btn btn-default slide back">
      <span class="fa-chevron-left"></span> {{t 'domain_list'}}
    </a>
</div>
<div class="clearfix"></div>
<h1 class="view-title">{{t 'domain_add'}}</h1>

<div class="br"></div>

<form action="#/domains/add" method="POST" class="form-horizontal">

<div class="panel-group" id="accordion">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="#collapseOne">
          {{t 'domain_add_panel_with_domain'}}
        </a>
      </h4>
    </div>
    <div id="collapseOne" class="panel-collapse collapse">
      <div class="panel-body">
        <small>{{t 'domain_add_dns_doc'}}</small>
        <hr>
        <div class="form-group">
            <label for="domain" class="col-sm-3 control-label">{{t 'domain_name'}}</label>
            <div class="col-sm-9">
                <input type="text" name="domain" class="form-control" placeholder="{{t 'myserver_org'}}">
            </div>
        </div>
      </div>
    </div>
  </div>
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="#collapseTwo">
          {{t 'domain_add_panel_with_domain'}}
        </a>
      </h4>
    </div>
    <div id="collapseTwo" class="panel-collapse collapse">
      <div class="panel-body">
        <small>{{t 'domain_add_dyndns_doc'}}</small>
        <hr>
        <div class="form-group">
            <label for="ddomain" class="col-sm-3 control-label">{{t 'domain_name'}}</label>
            <div class="clearfix visible-xs"></div>
            <div class="col-sm-4 col-xs-6">
                <input type="text" name="ddomain" class="form-control" placeholder="{{t 'myserver'}}">
            </div>
            <div class="col-sm-5 col-xs-6">
               <select class="form-control" name="ddomain-ext">
                   {{#DDomains}}
                       <option>{{.}}</option>
                   {{/DDomains}}
               </select>
            </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="br"></div>

<div class="text-center">
    <input type="submit" class="btn btn-success slide back" value="{{t 'add'}}">
</div>

</form>
