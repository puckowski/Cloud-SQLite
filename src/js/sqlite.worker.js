'use strict';

let db = null;
let oo = null;
let sqlite3 = null;

if (globalThis.window !== globalThis) {
    let sqlite3Js = 'sqlite3.js';
    const urlParams = new URL(globalThis.location.href).searchParams;
    if (urlParams.has('sqlite3.dir')) {
        sqlite3Js = urlParams.get('sqlite3.dir') + '/' + sqlite3Js;
    }
    importScripts(sqlite3Js);
}

globalThis.sqlite3InitModule().then(function (readySqlite3) {
    sqlite3 = readySqlite3;
    oo = sqlite3.oo1;
    db = new oo.DB("/mydb.sqlite3", 'ct');
    postMessage({ ready: 'SQLite ready' });
});

self.onmessage = (message) => {
    const exportMode = message.data.export;

    if (exportMode) {
        let exportSql = '';
        let resultRows = [];
        db.exec({
            sql: 'SELECT * FROM sqlite_master WHERE type = \'table\';',
            rowMode: 'object',
            resultRows: resultRows
        });
        const names = [];
        for (let index = 0; index < resultRows.length; ++index) {
            exportSql += resultRows[index].sql + ';\n\n';
            names.push(resultRows[index].tbl_name);
        }
        for (let index = 0; index < names.length; ++index) {
            let resultColumns = [];
            db.exec({
                sql: 'PRAGMA table_info(\'' + names[index] + '\');',
                rowMode: 'object',
                resultRows: resultColumns
            });
            const typeMap = new Map();
            let insertSql = 'INSERT INTO ' + names[index] + '(';
            for (let nameIndex = 0; nameIndex < resultColumns.length; ++nameIndex) {
                if (nameIndex > 0) {
                    insertSql += ', ';
                }

                insertSql += resultColumns[nameIndex].name;
                typeMap.set(resultColumns[nameIndex].name, resultColumns[nameIndex].type);
            }
            insertSql += ') VALUES\n';
            let countRows = [];
            db.exec({
                sql: 'SELECT COUNT(*) as cnt FROM ' + names[index],
                rowMode: 'object',
                resultRows: countRows
            });
            let valuesCount = 0;

            if (countRows.length === 1) {
                const totalCount = countRows[0].cnt;

                for (let i = 0; i < totalCount; i += 1000) {
                    const start = i;
                    const end = Math.min(i + 1000, totalCount);
                    const pageSize = end - start;
                    let tableRows = [];
                    db.exec({
                        sql: 'SELECT * FROM ' + names[index] + ' LIMIT ' + pageSize + ' OFFSET ' + start,
                        rowMode: 'object',
                        resultRows: tableRows
                    });

                    for (let rowIndex = 0; rowIndex < tableRows.length; ++rowIndex) {
                        if (valuesCount > 0) {
                            insertSql += ', \n';
                        }
                        valuesCount++;

                        insertSql += '(';

                        for (let nameIndex = 0; nameIndex < resultColumns.length; ++nameIndex) {
                            if (nameIndex > 0) {
                                insertSql += ', ';
                            }

                            if (typeMap.get(resultColumns[nameIndex].name) === 'TEXT'
                                || typeMap.get(resultColumns[nameIndex].name) === 'VARCHAR'
                                || typeMap.get(resultColumns[nameIndex].name) === 'CHAR') {
                                let data = tableRows[rowIndex][resultColumns[nameIndex].name];
                                data = data.replace(/'/g, '\'\'');

                                insertSql += '\'' + data + '\'';
                            } else {
                                insertSql += tableRows[rowIndex][resultColumns[nameIndex].name];
                            }
                        }

                        insertSql += ')';
                    }
                }
            }

            if (!insertSql.endsWith(' VALUES\n')) {
                exportSql += insertSql + ';\n\n';
            }

            insertSql = '';
        }

        let viewRows = [];
        db.exec({
            sql: 'SELECT * FROM sqlite_master WHERE type = \'view\';',
            rowMode: 'object',
            resultRows: viewRows
        });

        for (let index = 0; index < viewRows.length; ++index) {
            exportSql += viewRows[index].sql + ';\n\n';
        }

        postMessage({ export: exportSql });
    } else {
        const sql = message.data.sql;

        if (sql) {
            try {
                let resultRows = [];

                db.transaction(function (D) {
                    D.exec({
                        sql,
                        rowMode: 'object',
                        resultRows: resultRows
                    });
                });

                if (resultRows) {
                    postMessage(JSON.stringify(resultRows, undefined, 2));
                } else {
                    postMessage('Success');
                }
            } catch (e) {
                if (e instanceof sqlite3.SQLite3Error) {
                    postMessage({ log: e.message });
                } else {
                    postMessage({ log: e });
                }
            }
        }
    }
};

self.onbeforeunload = function (event) {
    db.close();
};
