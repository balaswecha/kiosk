resx=`xdpyinfo  | grep dimensions| grep -o " [0-9]\+x[0-9]\+ " | grep -o "[0-9]\+"| head -n 1`
resy=`xdpyinfo  | grep dimensions| grep -o " [0-9]\+x[0-9]\+ " | grep -o "[0-9]\+"| head -n 2| tail -n 1`
x=$((resx/8))
y=$((4*resy/5))
resx=$((3*resx/4))
resy=$((resy/5))
echo $resx
echo $resy
gsettings set org.onboard.window docking-enabled true
onboard -s $resx'x'$resy -x $x -y $y
