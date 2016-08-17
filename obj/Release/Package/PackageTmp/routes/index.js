var sql = require('mssql');
var dbConfig = {
    server: '192.168.1.47\\MSSQL2014EX', //192.168.1.42\\MSSQL2014EX192.168.194.1
    database: 'KLS_Booking',
    user: 'sa',
    password: 'root',//fulfill
    // You can use 'localhost\\instance' to connect to named instance 

    port: 1433
};

exports.index = function (req, res) {
    res.render('index');
    //res.sendfile(__dirname + '/index.jade');
};
// JSON API for list of polls
exports.inboundView = function (req, res) {
    // Query, just get back the question text
    var conn = new sql.Connection(dbConfig);
    var req = new sql.Request(conn);
    var obj = {}
    conn.connect(function (err) {
        if (err) {
            console.log(err);
            return;
        }
        var arrObj = [];
        req.query("SELECT * FROM V_KPI_INB", function (err, recordset) {//TRST_ID = 7
            if (err) {
                console.log(err);

            } else {
                arrObj.push(recordset);

                req.query("SELECT * FROM V_KPI_INB_Right ORDER BY Plan_In ASC", function (err2, recordset2) {//TRST_ID = 7
                    if (err2) {
                        console.log(err2);

                    } else {
                        arrObj.push(recordset2);
                        res.json(arrObj);
                    }
                    conn.close();
                }); 
            }
        });
    });
};
exports.outboundView = function (req, res) {
    // Query, just get back the question text
    var conn = new sql.Connection(dbConfig);
    var req = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log(err);
            return;
        }
        var arrObj = [];
        req.query("SELECT * FROM V_KPI_OUTB", function (err, recordset) {//TRST_ID = 7
            if (err) {
                console.log(err);
            } else {
                arrObj.push(recordset);
                req.query("SELECT * FROM V_KPI_OUTB_Right ORDER BY Plan_In ASC", function (err2, recordset2) {//TRST_ID = 7
                    if (err2) {
                        console.log(err2);

                    } else {

                        arrObj.push(recordset2);
                        res.json(arrObj);
                    }
                    conn.close();
                });
            }
        });
    });
}
exports.inboundLeft = function (socket) {
    var refreshId = setInterval(function () {
        var conn = new sql.Connection(dbConfig);
        var req = new sql.Request(conn);
        conn.connect(function (err) {
            // socket.broadcast.emit('inbound', { data: '555' });
            req.query("SELECT TOP 1 * FROM dbo.NOTC WHERE Active = 1 AND Process='inboundLeft'", function (err, rows, fields) {
                if (err) {
                    throw err;
                    // console.log(err);
                } else {
                    if (rows.length > 0) {
                        req.query("SELECT * FROM V_KPI_INB", function (err, rows, fields) {//TRST_ID = 7
                            if (err) {
                                console.log(err2);

                            } else {
                                if (rows.length > 0){
                                    socket.volatile.emit('inbound', rows);
                                    exports.UpdateMessage('inboundLeft');
                                    
                                }
                                conn.close();
                            }
                        });
                    }
                }
            });
        });
    }, 1000 * 24);
}
exports.inboundRight = function (socket) {
    var refreshId = setInterval(function () {
        var conn = new sql.Connection(dbConfig);
        var req = new sql.Request(conn);
        conn.connect(function (err) {
            req.query("SELECT TOP 1 * FROM dbo.NOTC WHERE Active = 1 AND Process='inboundRight'", function (err, rows, fields) {
                if (err) {
                    throw err;
                } else {
                    if (rows.length > 0) {
                        req.query("SELECT * FROM V_KPI_INB_Right ORDER BY Plan_In", function (err2, recordset2) {//TRST_ID = 7
                            if (err2) {
                                console.log(err2);

                            } else {
                                socket.volatile.emit('right', recordset2);
                                exports.UpdateMessage('inboundRight');
                                recordset2.length = 0;
                                conn.close();
                            }
                        });
                    }
                }
            });
            
        });
    }, 1000 * 22);
}
exports.outboundLeft = function (socket) {
    var refreshId = setInterval(function () {
        var conn = new sql.Connection(dbConfig);
        var req = new sql.Request(conn);
        conn.connect(function (err) {
            // socket.broadcast.emit('inbound', { data: '555' });
            req.query("SELECT TOP 1 * FROM dbo.NOTC WHERE Active = 1 AND Process='outboundLeft'", function (err, rows, fields) {
                if (err) {
                    throw err;
                } else {
                    if (rows.length > 0) {
                        req.query("SELECT * FROM dbo.V_KPI_OUTB ", function (err, rows, fields) {
                            if (err) {
                                throw err;
                                // console.log(err);

                            } else {
                                if (rows.length > 0) {
                                    socket.volatile.emit('outbound', rows);
                                    exports.UpdateMessage('outboundLeft');
                                    rows.length = 0;
                                }
                                conn.close();
                            }
                        });
                    }
                }
            });
        });
    }, 1000 * 20);
};
exports.outboundRight = function (socket) {
        var refreshId = setInterval(function () {
            var conn = new sql.Connection(dbConfig);
            var req = new sql.Request(conn);
            conn.connect(function (err) {
                req.query("SELECT TOP 1 * FROM dbo.NOTC WHERE Active = 1 AND Process='outboundRight'", function (err, rows, fields) {
                    if (err) {
                        throw err;
                    } else {
                        if (rows.length > 0) {
                            req.query("SELECT * FROM V_KPI_OUTB_Right ORDER BY Plan_In", function (err, rows, fields) {//TRST_ID = 7
                                if (err) {
                                    throw err

                                } else {

                                    socket.volatile.emit('outright', rows);
                                    exports.UpdateMessage('outboundRight');
                                    rows.length = 0;
                                    conn.close();
                                }
                            });
                        }
                    }
                });
            });
        }, 1000 * 18);
};
exports.gate = function (req, res) {
    var conn = new sql.Connection(dbConfig);
    var req = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log(err);
            return;
        }
        req.query("SELECT * FROM MGATE WHERE GATE_TYP='IN' AND Description <> ''", function (err, recordset) {
            if (err) {
                console.log(err);

            } else {
                res.json(recordset);
                conn.close();
            }
        });
    });

};
exports.gateout = function (req, res) {
    var conn = new sql.Connection(dbConfig);
    var req = new sql.Request(conn);
    conn.connect(function (err) {
        if (err) {
            console.log(err);
            return;
        }
        req.query("SELECT * FROM MGATE WHERE GATE_TYP='OUT' AND Description <> '' ", function (err, recordset) {
            if (err) {
                console.log(err);

            } else {
                res.json(recordset);
                conn.close();
                //console.log(recordset);
            }
        });
    });
};
exports.UpdateMessage = function (where) {
    var conn = new sql.Connection(dbConfig);
    var req = new sql.Request(conn);

    conn.connect(function (err) {
        if (err) {
            console.log(err);
            return;
        }
        req.query("UPDATE dbo.NOTC SET Active=0 WHERE Process='"+where+"'", function (err, recordset) {
            if (err) {
                console.log(err);

            }
            conn.close();
        });
    });
}
