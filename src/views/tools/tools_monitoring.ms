<div class="btn-breadcrumb">
    <a href="#/" ><i class="fa-home"></i><span class="sr-only">{{t 'home'}}</span></a>
    <a href="#/tools">{{t 'tools'}}</a>
    <a href="#/tools/monitor">{{t 'monitoring'}}</a>
</div>

<div class="separator"></div>

{{#if status}}
<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-info-circle"></span> {{t 'infos'}}</h2>
    </div>
    <div class="panel-body">
        <dl class="dl-horizontal">
            <dt>{{t 'hostname'}}</dt>
            <dd>{{system.infos.hostname}}</dd>
            <dt>{{t 'os'}}</dt>
            <dd>{{ucwords system.infos.linux_distro}} {{system.infos.platform}} ({{system.infos.os_name}} {{system.infos.os_version}})</dd>
            <dt>{{t 'uptime'}}</dt>
            <dd>{{system.uptime}}</dd>
        </dl>
    </div>
</div>

<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="fa-fw fa-cogs"></span> {{t 'versions'}}</h2>
    </div>
    <div class="panel-body">
        <dl class="dl-horizontal">
            {{#each versions}}
            <dt>{{@key}}</dt>
            <dd>{{.}}</dd>
            {{/each}}
        </dl>
    </div>
</div>

<div class="panel-group" id="accordion">

    <div class="panel panel-default">
        <div class="panel-heading">
            <h2 class="panel-title">
                <span class="fa-fw fa-check-square-o"></span>
                <a data-toggle="collapse" data-parent="#accordion" href="#check">{{t 'check'}}</a>
            </h2>
        </div>
        <div id="check" class="panel-collapse collapse">
            <div class="panel-body">
                <dl class="dl-horizontal">
                    <dt>{{t 'check_stmp'}}</dt>
                    <dd>{{network.check.smtp_check}}</dd>
                    <dt>{{t 'check_mx'}}</dt>
                    <dd>
                        {{#if network.check.mx_check.mx0}}
                        <ul>
                            {{#each network.check.mx_check}}
                                    <li>{{this}}</li>
                            {{/each}}
                        </ul>
                        {{else}}
                              {{network.check.mx_check}}
                        {{/if}}
                    </dd>
                </dl>
            </div>
        </div>
    </div>

    <div class="panel panel-default">
        <div class="panel-heading">
            <h2 class="panel-title">
                <span class="fa-fw fa-cog"></span> 
                <a data-toggle="collapse" data-parent="#accordion" href="#system">{{t 'system'}}</a>
            </h2>
        </div>
        <div id="system" class="panel-collapse collapse">
            <div class="panel-body row">

                <div class="col-md-4">
                    <h3>{{t 'memory'}}</h3>
                    <h4>{{t 'ram'}}</h4>
                    <table class="table table-condensed">
                        <tr>
                            <td>{{t 'used'}}</td>
                            <td>{{humanSize system.memory.ram.used}} ({{system.memory.ram.percent}} %)</td>
                        </tr>
                        <tr>
                            <td>{{t 'free'}}</td>
                            <td>{{humanSize system.memory.ram.free}}</td>
                        </tr>
                        <tr class="active">
                            <td>{{t 'total'}}</td>
                            <td>{{humanSize system.memory.ram.total}}</td>
                        </tr>
                    </table>

                    <h4>{{t 'swap'}}</h4>
                    <table class="table table-condensed">
                        <tr>
                            <td>{{t 'used'}}</td>
                            <td>{{humanSize system.memory.swap.used}} ({{system.memory.swap.percent}} %)</td>
                        </tr>
                        <tr>
                            <td>{{t 'free'}}</td>
                            <td>{{humanSize system.memory.swap.free}}</td>
                        </tr>
                        <tr class="active">
                            <td>{{t 'total'}}</td>
                            <td>{{humanSize system.memory.swap.total}}</td>
                        </tr>
                    </table>
                </div>

                <div class="col-md-4">
                    <h3>{{t 'cpu_load'}}</h3>
                    <table class="table table-condensed">
                        <tr>
                            <td>{{t 'count_min' "1"}}</td>
                            <td>{{system.cpu.load.min1}}</td>
                        </tr>
                        <tr>
                            <td>{{t 'count_min' "5"}}</td>
                            <td>{{system.cpu.load.min5}}</td>
                        </tr>
                        <tr>
                            <td>{{t 'count_min' "15"}}</td>
                            <td>{{system.cpu.load.min15}}</td>
                        </tr>
                    </table>
                </div>

                <div class="col-md-4">
                    <h3>{{t 'process'}}</h3>
                    <table class="table table-condensed">
                        <tr>
                            <td>{{t 'running'}}</td>
                            <td>{{system.process.running}}</td>
                        </tr>
                        <tr>
                            <td>{{t 'sleeping'}}</td>
                            <td>{{system.process.sleeping}}</td>
                        </tr>
                        <tr class="active">
                            <td>{{t 'total'}}</td>
                            <td>{{system.process.total}}</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <div class="panel panel-default">
        <div class="panel-heading">
            <h2 class="panel-title">
                <span class="fa-fw fa-cloud"></span>
                <a data-toggle="collapse" data-parent="#accordion" href="#network">{{t 'network'}}</a>
            </h2>
        </div>
        <div id="network" class="panel-collapse collapse">
            <div class="panel-body">
                <b>{{t 'public_ip'}}</b>{{network.infos.public_ip}}
                <br>
                <b>{{t 'gateway'}}</b>{{network.infos.gateway}}

                <h3>{{t 'local_ip'}}</h3>
                <table class="table table-condensed">
                    <thead>
                        <tr>
                            <th>{{t 'interface'}}</th>
                            <th>{{t 'ipv4'}}</th>
                            <th>{{t 'ipv6'}}</th>
                        </tr>
                    </thead>
                    <tbody>
                    {{#each network.infos.local_ip}}
                        <tr>
                            <td>{{@key}}</td>
                            <td>{{ ipv4 }}</td>
                            <td>{{ ipv6 }}</td>
                        </tr>
                    {{/each}}
                    </tbody>
                </table>

                <h3>{{t 'usage'}}</h3>
                {{#each network.usage}}
                <div class="clearfix">
                    <table class="table table-condensed">
                        <thead>
                            <tr>
                                <th>
                                    <h4>
                                        {{@key}}
                                        <small>{{t 'time_since_update'}}{{humanTime time_since_update}}</small>
                                    </h4>
                                </th>
                                <th>{{t 'bit_rate'}}</th>
                                <th>{{t 'cumulative_usage'}}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{{t 'transmission'}}</td>
                                <td>{{bitRate tx time_since_update}}</td>
                                <td>{{humanSize cumulative_tx}}</td>
                            </tr>
                            <tr>
                                <td>{{t 'reception'}}</td>
                                <td>{{bitRate rx time_since_update}}</td>
                                <td>{{humanSize cumulative_rx}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {{/each}}
            </div>
        </div>
    </div>

    <div class="panel panel-default">
        <div class="panel-heading">
            <h2 class="panel-title">
                <span class="fa-fw fa-hdd-o"></span>
                <a data-toggle="collapse" data-parent="#accordion" href="#disk">{{t 'disk'}}</a>
            </h2>
        </div>
        <div id="disk" class="panel-collapse collapse">
            <div class="panel-body">
                {{#each disk}}
                <div class="clearfix">
                <h3>{{@key}}</h3>
                <div class="row">
                    <div class="col-md-6">
                        <h4>{{t 'filesystem'}}</h4>
                        <table class="table table-condensed">
                            <tr>
                                <td>{{t 'fs_type'}}</td><td>{{ filesystem.fs_type }}</td>
                            </tr>
                            <tr>
                                <td>{{t 'mount_point'}}</td><td>{{ filesystem.mnt_point }}</td>
                            </tr>
                            <tr>
                                <td>{{t 'size'}}</td><td>{{humanSize filesystem.size }}</td>
                            </tr>
                            <tr>
                                <td>{{t 'used'}}</td><td>{{humanSize filesystem.used }}</td>
                            </tr>
                            <tr class="active">
                                <td>{{t 'available'}}</td><td>{{humanSize filesystem.avail }}</td>
                            </tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h4>{{t 'io'}} <small>{{t 'time_since_update'}}{{humanTime io.time_since_update }}</small></h4>
                        <table class="table table-condensed">
                            <tr>
                                <td>{{t 'read'}}</td><td>{{humanSize io.read_bytes }}</td>
                            </tr>
                            <tr>
                                <td>{{t 'write'}}</td><td>{{humanSize io.write_bytes }}</td>
                            </tr>
                        </table>
                    </div>
                </div>
                {{/each}}
            </div>
        </div>
    </div>

</div><!-- .panel-group -->

{{else}}
<div class="alert alert-warning">
    <span class="fa-exclamation-triangle"></span>
    {{t 'monitoring_disabled'}}
    <br>
    {{t 'monitoring_check_glances'}}
</div>

{{/if}}
