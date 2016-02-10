#!/bin/bash
gsettings set org.gnome.system.proxy mode 'manual'
gsettings set org.gnome.system.proxy.http host 'localhost'
gsettings set org.gnome.system.proxy.http port 8118
gsettings set org.gnome.system.proxy.https host 'localhost'
gsettings set org.gnome.system.proxy.https port 8118
gsettings set org.gnome.system.proxy ignore-hosts "[]"
resx=`xdpyinfo  | grep dimensions| grep -o " [0-9]\+x[0-9]\+ " | grep -o "[0-9]\+"| head -n 1`
resy=`xdpyinfo  | grep dimensions| grep -o " [0-9]\+x[0-9]\+ " | grep -o "[0-9]\+"| head -n 2| tail -n 1`
electron main.js $resx $resy
