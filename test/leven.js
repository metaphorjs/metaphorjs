

function levenshtein(S1, S2) {

    console.log(S1, " : ", S2);

    var m = S1.length,
        n = S2.length,
        D = new Array(m + 1),
        P = new Array(m + 1);

    // Базовые значения
    for (var i = 0; i <= m; i++) {
        D[i]    = new Array(n + 1);
        P[i]    = new Array(n + 1);
        D[i][0] = i;
        P[i][0] = 'D';
    }
    for (var i = 0; i <= n; i++) {
        D[0][i] = i;
        P[0][i] = 'I';
    }

    for (i = 1; i <= m; i++)
    for (var j = 1; j <= n; j++) {
        var cost = (S1.charAt(i - 1) != S2.charAt(j - 1)) ? 1 : 0;

        if(D[i][j - 1] < D[i - 1][j] && D[i][j - 1] < D[i - 1][j - 1] + cost) {
            //Вставка
            D[i][j] = D[i][j - 1] + 1;
            P[i][j] = 'I';
        }
        else if(D[i - 1][j] < D[i - 1][j - 1] + cost) {
            //Удаление
            D[i][j] = D[i - 1][j] + 1;
            P[i][j] = 'D';
        }
        else {
            //Замена или отсутствие операции
            D[i][j] = D[i - 1][j - 1] + cost;
            P[i][j] = (cost == 1) ? 'R' : 'M';
        }
    }

    //Восстановление предписания
    //StringBuilder route = new StringBuilder("");
    var route = "";
    i = m;
    j = n;

    do {
        var c = P[i][j];
        //route.append(c);
        route += c;
        if(c == 'R' || c == 'M') {
            i --;
            j --;
        }
        else if(c == 'D') {
            i --;
        }
        else {
            j --;
        }
    } while((i != 0) || (j != 0));

    //return new Prescription(D[m][n], route.reverse().toString());
    console.log(D[m][n]);
    console.log(route.split("").reverse().join(""));
}


function levenshteinArray(S1, S2) {

    var m = S1.length,
        n = S2.length,
        D = new Array(m + 1),
        P = new Array(m + 1),
        i, j, c,
        route,
        cost,
        dist,
        ops = 0;

    if (m == n && m == 0) {
        return {
            changes: 0,
            distance: 0,
            prescription: []
        };
    }

    // Базовые значения
    for (i = 0; i <= m; i++) {
        D[i]    = new Array(n + 1);
        P[i]    = new Array(n + 1);
        D[i][0] = i;
        P[i][0] = 'D';
    }
    for (i = 0; i <= n; i++) {
        D[0][i] = i;
        P[0][i] = 'I';
    }

    for (i = 1; i <= m; i++)
        for (j = 1; j <= n; j++) {
            cost = (S1[i - 1] !== S2[j - 1]) ? 1 : 0;

            if(D[i][j - 1] < D[i - 1][j] && D[i][j - 1] < D[i - 1][j - 1] + cost) {
                //Вставка
                D[i][j] = D[i][j - 1] + 1;
                P[i][j] = 'I';
            }
            else if(D[i - 1][j] < D[i - 1][j - 1] + cost) {
                //Удаление
                D[i][j] = D[i - 1][j] + 1;
                P[i][j] = 'D';
            }
            else {
                //Замена или отсутствие операции
                D[i][j] = D[i - 1][j - 1] + cost;
                if (cost == 1) {
                    P[i][j] = 'R';
                }
                else {
                    P[i][j] = '-';
                }
            }
        }

    //Восстановление предписания
    route = [];
    i = m;
    j = n;

    do {
        c = P[i][j];
        route.push(c);
        if (c != '-') {
            ops++;
        }
        if(c == 'R' || c == '-') {
            i --;
            j --;
        }
        else if(c == 'D') {
            i --;
        }
        else {
            j --;
        }
    } while((i != 0) || (j != 0));

    dist = D[m][n];

    return {
        changes: ops / route.length,
        distance: dist,
        prescription: route.reverse()
    };
}

var a1 = ["a", "b", "d", "e", "f"];
var a2 = ["a", "c", "e", "d", "f"];

console.log(a1);
console.log(a2);
console.log("---");
var res     = levenshteinArray(a1, a2);
console.log(res);
console.log("---");

var i, len, o,
    pres = res.prescription;

for (i = 0, len = pres.length; i < len; i++) {

    o = pres[i];

    if (o == '-') {
        continue;
    }

    if (o == 'D') {
        a1.splice(i, 1);
    }

    if (o == 'R') {
        a1[i] = a2[i];
    }

    if (o == 'I') {
        if (i > a1.length - 1) {
            a1.push(a2[i]);
        }
        else {
            a1.splice(i, 0, a2[i]);
        }
    }
}

console.log(a1);