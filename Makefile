# npm install -g coffee-script
# npm install -g uglify-js
default:
    coffee --compile --output chrono.js src/chrono.coffee
    uglifyjs -o chrono.min.js chrono.js