apt-get install -y privoxy
apt-get install -y monit
cp privoxy.monit /etc/monit/conf-enabled/privoxy
cp default.action.privoxy /etc/privoxy/default.action
