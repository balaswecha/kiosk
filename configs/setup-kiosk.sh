#!/bin/bash
apt-get install -y --force-yes onboard
apt-get install -y --force-yes privoxy
cp --parents kiosk.conf ~/.init
cp default.action.privoxy /etc/privoxy/default.action
cp blocked /etc/privoxy/templates/
