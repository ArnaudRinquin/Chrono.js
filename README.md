# Chrono.js
Javascript is really bad at handling time related tasks:
* It's not accurate (try it yourself at https://gist.github.com/4175664)
* It's not that easy to control
* Durations have to be calculated

Chrono.js is a library that focuses on solving these problems:
* Handle time with precision
* Do something at regular intervals
* Easily measure durations
* Make countdowns
* Gives exploitable information on ellapsed / remaining time

# Summary
* [Usage](#usage)
* [Timer](#timer)
* [Chrono](#chrono)
* [new Chrono()](#new-chrono)
* [start(), stop(), reset()](#controls)
* [handlers binding](#handlers-binding)
* [ticking, settings](#attributes)
* [time()](#timechanges)
* [remainingTime()](#remainingtimechanges)
* [Building Chorno.js](#building-chronojs)

# Usage
Chrono.js exports 2 classes : `Chrono` and `Timer`.

Including Chrono.js into your code is as easy as you could expect it:

``` html
<script src="chrono.min.js"></script>
```

Or with require

``` javascript
var chronojs = require('chrono');
var Chrono = chronojs.Chrono;
var Timer = chronojs.Timer;
```
Good to know : Chrono.js does not rely on any other library.

# API
## Timer
As said in introduction, setInterval isn't accurate and uneasy to control. Timer class fixes that.

Here is an example:

``` javascript
Timer = require('chrono').Timer;

var timer = new Timer(100, function(){/* done every 100ms */});
timer.start();
// ...
timer.stop();
```

## Chrono
### new Chrono()
Chrono class will help you to measure passing time and make countdown.
Importation and creation is easy.

``` javascript
var Chrono  = require('chrono').Chrono

var chrono = new Chrono([settings], [*handlers]);
```

#### Settings
Settings object may have these following attributes:

`precision` : time between ticks. Default is one second

`startFrom` : current time value when Chrono starts (first start or reset)

`stopTo` : Chrono stops when reaching this time

These time related values can be passed in several equivalent ways, here is an example for 1 hour, 2 minutes, 3 seconds and 4 milliseconds
* as number in milliseconds
 * 3723004
* as string
 * '1h 2m 3s 4ms'
 * '1h2m 3s 4ms' // spaces between units are optionnal
 * '2m 4ms 1h 3s' // order is not important
* as an object
 * {h:1, m:2, s:3, ms:4}

Here is a complete example:

``` javascript
chrono = new Chrono({
  precision:100,
  startFrom: "1m 30s",
  stopTo: {
    h: 2
    m: 30,
    s:10
  }
});
```
For most case, you just need ot pass `precision`. You can pass it directly as a string or as a number but not as an Object:
  
``` javascript
chrono = new Chrono(1100); // OK
chrono = new Chrono('1s 100ms'); // OK
chrono = new Chrono({s:1 ms:100}); // not OK
```

#### Handlers
`handlers` params are the event callbacks. They will be called with `milliseconds`, `chrono` and `flag` parameters.

`milliseconds` is the amount of milliseconds the Chrono counted by the chrono while ticking. Calling `time()` will provide you nicer values but we didn't want to make potentially useless computation unless you ask for it.
  
`chrono` is the source of the calling so you don't have to save the reference.

`flag` is the reason why the handler was called. It can be either `tick`, `start`, `stop` or `end`

``` javascript
c = new Chrono({ms:100}, function(ticks, chrono, flag) { // tick every 100ms
  console.log("ticks " + ticks);
});
```

### Controls
You can use the 3 self-explained chainable functions:

* `start()`
* `stop()`
* `reset([settings])`

Few details:

* `stop` do not reset the number of ticks, it just stops the ticking.
* `stop` is not a toggle, you have to call `start`
* You can change settings when calling settings with the same format as in the constructor. Only difference, you can't directly pass a precision as an object (but it's ok as a string or number).
* `reset` will stop the Chrono so you don't have to do it first, chaining it with `start()` is easy a nice way to take new settings into account.

``` javascript
// 100ms Chrono
chrono = new Chrono({precision:100});
chrono.start();
// ... restart from 1 minute with a 5 seconds precision
chrono.reset({
  startFrom:'1m',
  precision: '5s'
}).start();
```

### Handlers binding
You can easily bind / unbind handlers:

``` javascript
var handler = function(ticks, chrono, flag) {
  console.log('flag:' + flag);
};
  
var anotherOne = function(){
  console.log('tic'); 
};

var chrono = new Chrono('200ms');
  
chrono.bind(handler, anotherOne);
// ...
chrono.unbind(anotherOne); // This one would be annoying
```

### Attributes
You can access these read-only attributes:
* `ticking`
* `settings`, the default settings merged with the settings you passed

```javascript
chrono = new Chrono({precision:100});
chrono.ticking;
>false
chrono.start().ticking;
>true
chrono.stop().ticking;
>false
chrono.start().reset().ticking;
>false
```

### `time([changes])`
`time()` is a read/write function on ellapsed time.
It will always return the current ellapsed time as an object with `ms`, `s`, `m`, `h` attributes which are computed based on ellpased time.
  
Quick example:
``` javascript

var chrono = new Chrono({}, function(ms, ch, flag){
  
  if(ms === 130000) { // 2min, 10sec
    console.log(ch.time()); // outputs {h:0, m:2, s:10, ms:0}
  }
});
```

It can take changes as parameters. For now, it only takes it as a string. Here are a few examples:
``` javascript
var chrono = new Chrono();
chrono.time('1s'); // {h:0, m:0, s:1, ms:0}
chrono.time('+2s'); // {h:0, m:0, s:3, ms:0}
chrono.time('+3m'); // {h:0, m:3, s:3, ms:0}
chrono.time('*5m'); // {h:0, m:15, s:3, ms:0}
chrono.time('-5m 10s'); {h:0, m:10, s:10, ms:0}, handles several changes at one
chrono.time('/2m'); {h:0, m:5, s:0, ms:0}
chrono.time('+5h1500ms'); {h:5, m:10, s:11, ms:500}, spaces are optionnal
```
  
### `remainingTime([changes])`
`remainingTime()` works the very like `time()` except it's related to the time until `stopTo` is reached. It will return the same type of time object when called and can take changes into account if needed. Changes will be applied by changing the settings.stopTo value.
  
It will return `undefined` if no value has been set to `stopTo`.
  
Here is an example :
  
```javascript
var chrono = new Chrono({
  startFrom:'3m10s',
  stopTo:'5m42s'
});

console.log chrono.remainingTime();
// outputs : {h:0, m:2, s:32, ms:0}

console.log chrono.remaningTime('+2m -12s');
// outputs : {h:0, m:4, s:20, ms:0}
  
console.log chrono.time();
// outputs : {h:0, m:3, s:10, ms:0} as current time never changed
```

# Building Chrono.js
If you want to build Chrono.js from its source, you can just use grunt.
Several tasks are available:

* `grunt` builds Chrono.js and run fast (<1sec) tests
* `grunt build` builds Chrono.js without running any tests (you don't want that)
* `grunt longtest` builds and run long tests (2 minutes and more)
* `grunt buildDemo` builds Chrono.js, runs tests and builds the demo files
* `grunt watchDemo` is buildDemo + watch any file update to re-run and refresh Chrome

You don't have to run long tests unless you change something because I already run them for you.