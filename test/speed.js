
    var uid = ['0', '0', '0'];

    var nextUid  = function() {
        var index = uid.length;
        var digit;

        while(index) {
            index--;
            digit = uid[index].charCodeAt(0);
            if (digit == 57 /*'9'*/) {
                uid[index] = 'A';
                return uid.join('');
            }
            if (digit == 90  /*'Z'*/) {
                uid[index] = '0';
            } else {
                uid[index] = String.fromCharCode(digit + 1);
                return uid.join('');
            }
        }
        uid.unshift('0');
        return uid.join('');
    };

    var hashes     = {},
    randomHash = function() {
        var N = 10;
        return new Array(N+1).join((Math.random().toString(36)+'00000000000000000')
            .slice(2, 18)).slice(0, N);
    },
    nextHash    = function() {
        var hash    = randomHash();
        return !hashes[hash] ? (hashes[hash] = hash) : nextHash();
    };

var i, start, end;

nextUid();
nextHash();


start = (new Date).getTime();
for (i = 0; i < 1000; i++) {
    nextUid();
}
end     = (new Date).getTime();
console.log("uid", end - start);



start = (new Date).getTime();
for (i = 0; i < 1000; i++) {
    nextHash();
}
end     = (new Date).getTime();
console.log("hash", end - start);
