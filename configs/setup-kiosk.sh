#!/bin/bash
apt-get install -y --force-yes onboard
apt-get install -y --force-yes privoxy
apt-get install -y --force-yes monit
cp privoxy.monit /etc/monit/conf-enabled/privoxy
cp default.action.privoxy /etc/privoxy/default.action
cp blocked /etc/privoxy/templates/
