# Chrono.js
Javascript is really bad at handling time related tasks:
* It's not reliable (try it yourself at https://gist.github.com/4175664)
* It's not that easy to control
* Durations have to be calculated

Chrono.js is a library that focuses on solving these problems:
* Handle time with precision
* Do something at regular intervals
* Easily measure durations
* Make countdowns * To be implemented *
* Gives exploitable information on ellapsed / remaining time

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
As said in introduction, setInterval isn't reliable uneasy to control. Timer class fixes that.

Here is an example:

``` javascript
Timer = require('chrono').Timer;

var timer = new Timer(100, function(){/* done every 100ms */});
timer.start();
// ...
timer.stop();
```

## Chrono
Chrono class will help you to measure passing time and make countdown.
Importation and creation is easy.

``` javascript
var Chrono  = require('chrono').Chrono

var chrono = new Chrono([settings], [*handlers]);
```

### Settings
`precision` : time between ticks. Default is one second

`startFrom` : current time value when Chrono starts (first start or reset)

`stopTo` : Chrono stops when reaching this time * To be implemented *

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

### Handlers

`handlers` params are callback function that will be called at every tick. They will be called with `ticks` and `chrono` parameters.

`ticks` represent the amount of ticks the Chrono has made. If you reset the
Chrono to a certain amount of ticks or changed the time attributes, theses 
changes will be taken into account.

`flag` is the reason why the handler was called. It can be either 'tick', 'started' or 'stopped'

``` javascript
c = new Chrono({}, function(ticks, chrono, flag) { // tick every 100ms
  console.log("ticks " + ticks);
});
```

## Attributes

You can access these attributes:

* `ticking` (read-only)
* `settings`, the default settings merged with the settings you passed

## Controls
You can use the 3 self-explained chainable functions:

* `start()`
* `stop()`
* `reset([settings])`

Let's say it's not clear enough, here are some hints:

* `stop` do not reset the number of ticks, it just stops the ticking.
* `stop` is not a toggle, you have to call `start`
* you can set the Chrono to a given time by passing `ticks` to `reset([ticks])`. Default is `0`
* `reset` will `stop` the Chrono so you don't have to do it first, you can chain with start if you want

``` javascript
// 100ms Chrono
chrono = new Chrono({precision:100});
chrono.start();
// ... restart from 5 seconds
chrono.reset(5000).start();
```

You can know the chrono's state from it's `ticking` attribute:

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

## Handling ticks
The handlers you pass to your Chrono will receive to parameters every at ticks: the current `tick`number and the `chrono ` itself.

``` javascript
c = new Chrono({precision:100}, function(tick, chrono) { // tick every 100ms
  console.log("this the " + tick + "th tick");
  if (tick > 100) { // stop after 100 * 100 = 10.000ms = 10 secs
    chrono.stop();
  }
});
```

## Accessing and setting elapsed time numbers
You can access elapsed seconds (0-59), minutes (0-59) and hours (0+) by direcly accessing the corresponding attributes.

``` javascript
chrono = new Chrono({precision:1000}); // 1 tick = 1 second
chrono.reset(3 * 3600 + 24 * 60 + 12); // set to 3h24min12sec
console.log(chrono.hours + 'h' + chrono.minutes + 'min' + chrono.seconds + 'sec');
>3h24min12sec
```

You can also set them individually (*only in optimized mode, see below*):

```
chrono = new Chrono({precision:1000}); // 1 tick = 1 second
chrono.reset(3 * 3600 + 24 * 60 + 12); // set to 3h24min12sec
chrono.hours = 4; //4h24min12sec
chrono.minutes = 10; //4h10min12sec
chrono.seconds = 2; //4h10min2sec

// you can do some very odd things too
chrono.minutes = -10; //3h50min12sec (= 4h-10min12sec)
chrono.seconds = 62; //3h51min2sec (=3h50min62sec)
```

# Chrono.js is optimized
Chrono.js will compute elapsed time (seconds, minutes, hours) only on access. This optimization is only available on ECMA5 compliant env (use of Object.defineProperty). You may want to use a polyfill to enjoy this feature.

# Building Chrono.js
If you want to build Chrono.js from its source, you can just use grunt.
3 tasks are available:

* `grunt` will build Chrono.js and run fast (<1sec) tests
* `grunt build` will just build Chrono.js without running any tests (you don't want that)
* `grunt all` will build and run long tests (hours)

You should not have to run long tests unless you change something 'hours' attribute related because I already run them for you.