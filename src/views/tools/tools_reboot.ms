<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/tools">{{t 'tools'}}</a>
    <a href="#/tools/reboot">{{t 'tools_shutdown_reboot'}}</a>
</div>

<div class="separator"></div>


<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title">
            <span class="fa-fw fa-wrench"></span> {{t 'operations'}}
        </h2>
    </div>
    <div class="panel-body">
        <p>   
            <button class="btn btn-danger" data-action="reboot">
                <i class="fa-refresh"></i> {{t 'tools_reboot_btn'}}
            </button>
        </p>
        <p>
            <button class="btn btn-danger" data-action="shutdown">
                <i class="fa-power-off"></i> {{t 'tools_shutdown_btn'}}
            </button>
        </p>
    </div>
</div>
