Use a base that works with node, and our version of ffmpeg in server. 
if base can't run jar, install something that can or use new base?
install extra stuff for database
set workdir

copy package.json and lock then run npm i if it has changes. then copy the rest of the code

add volumes for the results and videos dir and use env variables
run a command to start