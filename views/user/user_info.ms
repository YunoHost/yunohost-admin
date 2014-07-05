<div class="container pull-left">
    <div class="row">
        <div id="bc1" class="btn-group btn-breadcrumb">
            <a href="#/" class="btn btn-default"><i class="fa fa-home"></i></a>
            <a href="#/users" class="btn btn-default hidden-xs"><div>{{t 'users'}}</div></a>
            <a href="#/users" class="btn btn-default visible-xs"><div>...</div></a>
            <a href="#/users/{{username}}" class="btn btn-default"><div>{{username}}</div></a>
        </div>
    </div>
</div> 


<div class="clearfix"></div>

<div class="br"></div>

<div class="panel panel-default">
  <div class="panel-heading">
    <h2 class="panel-title">{{fullname}}</h2>
  </div>

  <div class="panel-body">
    <div class="row">
      <div class="col-md-3 col-lg-3" align="center">
        <span class="fa-fw fa-user" style="font-size: 120px;">
      </div>

      <div class=" col-md-9 col-lg-9">
        <table class="table table-user-information">
          <tbody>
            <tr>
              <td><strong>{{t 'user_username'}}</strong></td>

              <td>{{username}}</td>
            </tr>

            <tr>
              <td><strong>{{t 'user_email'}}</strong></td>

              <td>{{mail}}</td>
            </tr>

            <tr>
              <td><strong>{{t 'user_emailaliases'}}</strong></td>

              <td>{{#if mail-aliases}} {{#mail-aliases}}
              {{.}}<br>
              {{/mail-aliases}} {{/if}}</td>
            </tr>

            <tr>
              <td><strong>{{t 'user_emailforward'}}</strong></td>

              <td>{{#if mail-forward}} {{#mail-forward}}
              {{.}}<br>
              {{/mail-forward}} {{/if}}</td>
            </tr>
          </tbody>
        </table>
          <span class="pull-right">
            <a href="#/users/{{username}}/edit" class="btn btn-info slide"><span class="fa-pencil-square-o"/> {{t 'user_username_edit' username}}</a>
            <a href="#/users/{{username}}/delete" class="btn btn-danger slide back"><span class="fa-trash-o"/> {{t 'delete'}}</a>
          </span>  
      </div>  
    </div>    
  </div>      
</div>        
