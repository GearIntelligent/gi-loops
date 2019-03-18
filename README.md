# loops
Loops utility


## installation

```bash
$ npm install --save gi-loops
```


## functions

|                Fn               |        Type       | callback         |
|:-------------------------------:|:-----------------:|------------------|
| xLoop(array, handler, callback) |  batch-processing | on argument      |
|     xLoopEx(array, handler)     |  batch-processing | `Promise` return |
| yLoop(array, handler, callback) | single-processing | on argument      |
|     yLoopEx(array, handler)     | single-processing | `Promise` return |

#### `array`

array can be `Array` or `Object`

#### `handler`

handler is function for handling value on array while looping
here example handler function
```js
function (x, value, index) {
  // do something

  // then end with call x
  x(true, true);
}
```
`x` arguments:
```js
x(result, continue);
```

#### `callback`

callback is function for handling end of loop


## usage

```js
import { xLoop, xLoopEx, yLoop, yLoopEx } from 'gi-loops';

const data = {
  testA: 'A',
  testB: 'B',
};

const handler = (x, item, index) => {
  // do something async or sync actions
  if (item === 'B' && index > 0)
  {
    setTimeout(() => {
      x('B is good');
    }, 1000);
  }
  else x(item);
};

// with xLoop
xLoop(data, handler, (arr, result) => {
  if (result)
  {
    console.log('done good', arr);
  }
  else
  {
    console.log('done with error');
  }
});

// with xLoopEx
xLoopEx(data, handler)
  .then(arr => {
     console.log('done good', arr);
  })
  .catch(err => {
    console.log('done with error', err);
  });
 
// with yLoop
yLoop(data, handler, (arr, result) => {
  if (result)
  {
    console.log('done good', arr);
  }
  else
  {
    console.log('done with error');
  }
});

// with yLoopEx
yLoopEx(data, handler)
  .then(arr => {
     console.log('done good', arr);
  })
  .catch(err => {
    console.log('done with error', err);
  });
```
