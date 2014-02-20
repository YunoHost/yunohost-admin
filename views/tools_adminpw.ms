<div class="pull-left">
    <a href="#/tools" class="btn btn-default slide back"><span class="glyphicon glyphicon-chevron-left"></span> Tools</a>
</div>
<div class="clearfix"></div>
<div class="view-title">Change administration password</div>
<div class="br"></div>

<form action="#/tools/adminpw" method="PUT" class="form-horizontal">

	<div class="panel panel-default">
	    <div class="panel-body">
	        <div class="form-group">
	            <label for="old_password" class="col-sm-3 control-label">Current password</label>
	            <div class="col-sm-5 col-xs-12">
	                <input type="password" name="old_password" class="form-control" placeholder="Enter your current password"/>
	            </div>
	        </div>
	        <hr />
	        <div class="form-group">
	            <label for="new_password" class="col-sm-3 control-label">New password</label>
	            <div class="col-sm-5 col-xs-12">
	                <input type="password" name="new_password" class="form-control" placeholder="Enter the new password"/>
	            </div>
	        </div>
	        <div class="form-group">
	            <label for="confirm_new_password" class="col-sm-3 control-label">Confirm</label>
	            <div class="col-sm-5 col-xs-12">
	                <input type="password" name="confirm_new_password" class="form-control" placeholder="Confirm the new password"/>
	            </div>
	        </div>
	    </div>
	</div>

	<div class="text-center">
	    <input type="submit" class="btn btn-success slide back" value="Save">
	</div>

</form>
