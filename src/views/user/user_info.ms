<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/users" class="hidden-xs">{{t 'users'}}</a>
    <a href="#/users" class="visible-xs">&hellip;</a>
    <a href="#/users/{{username}}">{{username}}</a>
</div>

<div class="separator"></div>

<div class="panel panel-default">
  <div class="panel-heading">
    <h2 class="panel-title">{{fullname}}</h2>
  </div>

  <div class="panel-body row">

    <div class="col-sm-3 col-lg-3 text-center">
      <span class="fa-fw fa-user" style="font-size: 120px;"></span>
    </div>

    <div class=" col-sm-9 col-lg-9">
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
            <td><strong>{{t 'user_mailbox_quota'}}</strong></td>
	    {{#if mailbox-quota.use}}
            <td>{{mailbox-quota.use}} / {{mailbox-quota.limit}}</td>
            {{else}}
            <td>{{mailbox-quota}}</td>
            {{/if}}
          </tr

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
