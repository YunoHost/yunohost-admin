<div class="pull-left">
    <a href="#/" class="btn btn-default slide back"><span class="glyphicon glyphicon-chevron-left"></span> Menu</a>
</div>
<div class="clearfix"></div>
<div class="view-title">Monitoring</div>
<div class="br"></div>

{{#if status}}
<div class="panel panel-default">
    <div class="panel-heading">
        <h2 class="panel-title"><span class="glyphicon glyphicon-info-sign"></span> Infos</h2>
    </div>
    <div class="panel-body">
        <ul class="list-unstyled">
          <li><b>Hostname: </b>{{system.infos.hostname}}</li>
          <li><b>OS: </b>{{ucwords system.infos.linux_distro}} {{system.infos.platform}} ({{system.infos.os_name}} {{system.infos.os_version}})</li>
          <li><b>Uptime: </b>{{system.uptime}}</li>
        </ul>
    </div>
</div>

<div class="panel-group" id="accordion">

    <div class="panel panel-default">
        <div class="panel-heading">
            <h2 class="panel-title">
                <span class="glyphicon glyphicon-cog"></span> 
                <a data-toggle="collapse" data-parent="#accordion" href="#system">System</a>
            </h2>
        </div>
        <div id="system" class="panel-collapse collapse">
            <div class="panel-body row">

                <div class="col-md-4">
                    <h3>Memory</h3>
                    <h4>RAM</h4>
                    <table class="table table-condensed">
                        <tr>
                            <td>Used</td>
                            <td>{{humanSize system.memory.ram.used}} ({{system.memory.ram.percent}} %)</td>
                        </tr>
                        <tr>
                            <td>Free</td>
                            <td>{{humanSize system.memory.ram.free}}</td>
                        </tr>
                        <tr class="active">
                            <td>Total</td>
                            <td>{{humanSize system.memory.ram.total}}</td>
                        </tr>
                    </table>

                    <h4>Swap</h4>
                    <table class="table table-condensed">
                        <tr>
                            <td>Used</td>
                            <td>{{humanSize system.memory.swap.used}} ({{system.memory.swap.percent}} %)</td>
                        </tr>
                        <tr>
                            <td>Free</td>
                            <td>{{humanSize system.memory.swap.free}}</td>
                        </tr>
                        <tr class="active">
                            <td>Total</td>
                            <td>{{humanSize system.memory.swap.total}}</td>
                        </tr>
                    </table>
                </div>

                <div class="col-md-4">
                    <h3>CPU Load</h3>
                    <table class="table table-condensed">
                        <tr>
                            <td>1 min</td>
                            <td>{{system.cpu.load.min1}}</td>
                        </tr>
                        <tr>
                            <td>5 min</td>
                            <td>{{system.cpu.load.min5}}</td>
                        </tr>
                        <tr>
                            <td>15 min</td>
                            <td>{{system.cpu.load.min15}}</td>
                        </tr>
                    </table>
                </div>

                <div class="col-md-4">
                    <h3>Process</h3>
                    <table class="table table-condensed">
                        <tr>
                            <td>Running</td>
                            <td>{{system.process.running}}</td>
                        </tr>
                        <tr>
                            <td>Sleeping</td>
                            <td>{{system.process.sleeping}}</td>
                        </tr>
                        <tr class="active">
                            <td>Total</td>
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
                <span class="glyphicon glyphicon-cloud"></span>
                <a data-toggle="collapse" data-parent="#accordion" href="#network">Network</a>
            </h2>
        </div>
        <div id="network" class="panel-collapse collapse">
            <div class="panel-body">
                <b>Public IP: </b>{{network.infos.public_ip}}
                <br>
                <b>Gateway: </b>{{network.infos.gateway}}

                <h3>Local IP</h3>
                <table class="table table-condensed">
                    <thead>
                        <tr>
                            <th>Interface</th>
                            <th>IPv4</th>
                            <th>IPv6</th>
                        </tr>
                    </thead>
                    <tbody>
                    {{#each network.infos.local_ip}}
                        <tr>
                            <td>{{@key}}</td>
                            <td>{{#this.ipv4}}{{this}}{{/this.ipv4}}</td>
                            <td>{{#this.ipv6}}{{this}}{{/this.ipv6}}</td>
                        </tr>
                    {{/each}}
                    </tbody>
                </table>

                <h3>Usage</h3>
                {{#each network.usage}}
                <div class="clearfix">
                    <table class="table table-condensed">
                        <thead>
                            <tr>
                                <th>
                                    <h4>
                                        {{@key}}
                                        <small>Time since update: {{humanTime time_since_update}}</small>
                                    </h4>
                                </th>
                                <th>Bit rate</th>
                                <th>Cumulative usage</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Transmission</td>
                                <td>{{bitRate tx time_since_update}}</td>
                                <td>{{humanSize cumulative_tx}}</td>
                            </tr>
                            <tr>
                                <td>Reception</td>
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
                <span class="glyphicon glyphicon-hdd"></span>
                <a data-toggle="collapse" data-parent="#accordion" href="#disk">Disk</a>
            </h2>
        </div>
        <div id="disk" class="panel-collapse collapse">
            <div class="panel-body">
                {{#each disk}}
                <div class="clearfix">
                <h3>{{@key}}</h3>
                <div class="row">
                    <div class="col-md-6">
                        <h4>Filesystem</h4>
                        <table class="table table-condensed">
                            <tr>
                                <td>FS Type</td><td>{{ filesystem.fs_type }}</td>
                            </tr>
                            <tr>
                                <td>Mount point</td><td>{{ filesystem.mnt_point }}</td>
                            </tr>
                            <tr>
                                <td>Size</td><td>{{humanSize filesystem.size }}</td>
                            </tr>
                            <tr>
                                <td>Used</td><td>{{humanSize filesystem.used }}</td>
                            </tr>
                            <tr class="active">
                                <td>Available</td><td>{{humanSize filesystem.avail }}</td>
                            </tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h4>I/O <small>Time since update: {{humanTime io.time_since_update }}</small></h4>
                        <table class="table table-condensed">
                            <tr>
                                <td>Read</td><td>{{humanSize io.read_bytes }}</td>
                            </tr>
                            <tr>
                                <td>Write</td><td>{{humanSize io.write_bytes }}</td>
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
    <span class="glyphicon glyphicon-exclamation-sign"></span>
    Monitoring is not enabled.
    <br>
    Check <a href="/#/services/glances">glances</a> service status.
</div>

{{/if}}
