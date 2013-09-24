<div class="pull-left">
    <a class="btn btn-lg btn-default slide back" href="#/domains"><span class="glyphicon glyphicon-chevron-left"></span> Domain list</a>
</div>
<div class="clearfix"></div>
<div class="view-title">Add domain</div>

<div class="br"></div>

<form action="#/domains" method="POST" class="form-horizontal">

<div class="panel-group" id="accordion">
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="#collapseOne">
          I already have a domain ...
        </a>
      </h4>
    </div>
    <div id="collapseOne" class="panel-collapse collapse">
      <div class="panel-body">
        <small>... and I have <a href="http://doc.yunohost.org">set my DNS correctly</a>.</small>
        <hr>
        <div class="form-group">
            <label for="domain" class="col-sm-4 control-label">Domain name</label>
            <div class="col-sm-8">
                <input type="text" name="domain" class="form-control" placeholder="myserver.org">
            </div>
        </div>
      </div>
    </div>
  </div>
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="#collapseTwo">
          I don't have a domain ...
        </a>
      </h4>
    </div>
    <div id="collapseTwo" class="panel-collapse collapse">
      <div class="panel-body">
        <small>... and I want a dynamic DNS service.</small>
        <hr>
        <div class="form-group">
            <label for="ddomain" class="col-sm-4 control-label">Domain name</label>
            <div class="col-sm-3" style="padding-right: 3px">
                <input type="text" name="ddomain" class="form-control" placeholder="myserver">
            </div>
            <div class="col-sm-5" style="padding-left: 0">
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
    <input type="submit" class="btn btn-lg btn-success slide back" value="Save">
</div>

</form>
