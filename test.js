/**
 * Created by Dmitry on 24.05.15.
 */
function MyAsync(finalCallback) {
    this.finalCallback = finalCallback;
    this.result = [];
    this.counter = 0;
}

MyAsync.prototype = {
    "add" : function (callback) {
        var that = this;
        this.counter ++;

        return function () {
            that.result[that.counter - 1] = callback.apply(this, arguments);
            that.check();
        };
    },

    "check" : function () {
        var that = this;
        this.counter --;
        if (this.counter == 0)
            process.nextTick(function () {
                that.finalCallback.call(that, that.result);
            });
    }
};

var my_async = new MyAsync(
    function (result) {
    });

//console.log("begin");
//setTimeout(test.add(function () {
//    console.log("2000ms"); return "2000ms"; }), 2000);
//
//setTimeout(test.add(function () {
//    console.log("1500ms"); return "1500ms"; }), 1500);
//
//setTimeout(test.add(function () {
//    console.log("1000ms"); return "1000ms"; }), 1000);
//
//console.log("end");