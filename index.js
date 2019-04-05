const getKeys = val => {
    if (val && typeof val === 'object')
    {
        if (Array.isArray(val))
        {
            return val.map((val, index) => index);
        }
        return Object.keys(val);
    }
    return [];
};

/**
 * x-loop function (batch processing)
 * @param {Array|Object} arr array sources
 * @param {Function} fn callback processor
 * @param {Function} done callback when done
 */
const xLoop = (arr, fn, done) => {
    if (
        typeof fn === 'function' &&
        typeof done === 'function' && (
            Array.isArray(arr) || (arr && typeof arr === 'object')
        )
    ) {
        const len = getKeys(arr).length;

        let iy = 0;
        const result = {};
        const blacklist = [];
        let doneCalled = false;

        getKeys(arr).forEach(i => {
            ((val, ix) => {
                const cbx = (res, con) => {
                    if (blacklist.indexOf(ix) >= 0) return false;
                    blacklist.push(ix);

                    if (res !== undefined) result[ix] = res;
                    iy += 1;

                    if (iy === len || con) {
                        if (doneCalled) return false;
                        doneCalled = true;
                        
                        done(result, iy, con !== false);
                    }
                    return true;
                }
                if (fn(cbx, val, ix, arr) === false) cbx(undefined);
            })(arr[i], i);
        });
        return len;
    }
    return false;
};
module.exports.xLoop = xLoop;

const xLoopEx = (arr, fn) => {
    return new Promise((resolve, reject) => {
        xLoop(arr, fn, (data, length, result) => {
            const ndata = data || {};
            ndata._length = length;
            ndata._result = result;
            ndata._last = Object.keys(ndata).length > 0 ? ndata[Object.keys(ndata).pop()] : null;

            if (result) resolve(ndata);
            else reject(ndata);
        });
    });
};
module.exports.xLoopEx = xLoopEx;

/**
 * y-loop function (one-by-one processing)
 * @param {Array|Object} arr array source
 * @param {Function} fn callback processor
 * @param {Function} done callback when done
 */
const yLoop = (arr, fn, done) => {
    if (
        typeof fn === 'function' &&
        typeof done === 'function' && (
            Array.isArray(arr) || (arr && typeof arr === 'object')
        )
    ) {
        const len = getKeys(arr).length;

        let iy = 0;
        const result = {};
        const blacklist = [];
        let resultLen = 0;

        const keys = getKeys(arr);
        const doNext = resume => {
            if (resume === false) return done(result, false, (iy + 1));
            if (iy >= len) return done(result, true, (iy + 1));
            iy += 1;

            const key = keys[iy - 1];
            ((val, ix) => {
                const cbx = (res, rsm) => {
                    if (blacklist.indexOf(ix) >= 0) return false;
                    blacklist.push(ix);

                    if (res !== undefined) {
                        result[ix] = res;
                        resultLen += 1;
                    }

                    if (res instanceof Error && rsm === false) throw res;
                    doNext(rsm !== false);
                    return true;
                }
                if (fn(cbx, val, ix, arr, result, resultLen) === false) cbx(undefined, false);
            })(arr[key], key);
            return true;
        }
        doNext();

        return len;
    }
    return false;
};
module.exports.yLoop = yLoop;

const yLoopEx = (arr, fn, silent) => {
    return new Promise((resolve, reject) => {
        yLoop(arr, fn, (data, result, length) => {
            const ndata = data || {};
            ndata._length = length;
            ndata._result = result;
            ndata._lastKey = Object.keys(ndata).length > 0 ? Object.keys(ndata).pop() : null;
            ndata._lastValue = ndata._lastKey !== null ? ndata[ndata._lastKey] : null;

            if (result || silent === true) resolve(ndata);
            else if (silent !== true) reject(ndata);
        });
    });
};
module.exports.yLoopEx = yLoopEx;

