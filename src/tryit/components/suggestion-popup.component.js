import { detectChanges, getState, markup, setState, textNode } from '../../../dist/sling.min';
import { getCaretCoordinates, getCaretPosition } from '../services/caret.service';
import FileService from '../services/file.service';
import { debounce } from '../services/throttle.service';

export class WordSuggestionComponent {

    constructor() {
        this.SQLITE_KEYWORDS_AND_PHRASES = [
            "BIGINT",
            "BINARY",
            "BLOB",
            "BOOLEAN",
            "CHAR",
            "CHARACTER",
            "CLOB",
            "DATE",
            "DEC",
            "DECFLOAT",
            "DECIMAL",
            "FLOAT",
            "INT",
            "INTEGER",
            "INTERVAL",
            "NCHAR",
            "NCLOB",
            "NATIONAL",
            "NUMERIC",
            "REAL",
            "ROW",
            "SMALLINT",
            "TIME",
            "TIMESTAMP",
            "VARCHAR",
            "VARYING",
            "VARBINARY",
            "ABS",
            "ACOS",
            "ARRAY_AGG",
            "ASIN",
            "ATAN",
            "AVG",
            "CAST",
            "CEIL",
            "CEILING",
            "COALESCE",
            "CORR",
            "COS",
            "COSH",
            "COUNT",
            "COVAR_POP",
            "COVAR_SAMP",
            "CUME_DIST",
            "DENSE_RANK",
            "DEREF",
            "ELEMENT",
            "EXP",
            "EXTRACT",
            "FIRST_VALUE",
            "FLOOR",
            "JSON_ARRAY",
            "JSON_ARRAYAGG",
            "JSON_EXISTS",
            "JSON_OBJECT",
            "JSON_OBJECTAGG",
            "JSON_QUERY",
            "JSON_TABLE",
            "JSON_TABLE_PRIMITIVE",
            "JSON_VALUE",
            "LAG",
            "LAST_VALUE",
            "LEAD",
            "LISTAGG",
            "LN",
            "LOG",
            "LOG10",
            "LOWER",
            "MAX",
            "MIN",
            "MOD",
            "NTH_VALUE",
            "NTILE",
            "NULLIF",
            "PERCENT_RANK",
            "PERCENTILE_CONT",
            "PERCENTILE_DISC",
            "POSITION",
            "POSITION_REGEX",
            "POWER",
            "RANK",
            "REGR_AVGX",
            "REGR_AVGY",
            "REGR_COUNT",
            "REGR_INTERCEPT",
            "REGR_R2",
            "REGR_SLOPE",
            "REGR_SXX",
            "REGR_SXY",
            "REGR_SYY",
            "ROW_NUMBER",
            "SIN",
            "SINH",
            "SQRT",
            "STDDEV_POP",
            "STDDEV_SAMP",
            "SUBSTRING",
            "SUBSTRING_REGEX",
            "SUM",
            "TAN",
            "TANH",
            "TRANSLATE",
            "TRANSLATE_REGEX",
            "TREAT",
            "TRIM",
            "TRIM_ARRAY",
            "UNNEST",
            "UPPER",
            "VALUE_OF",
            "VAR_POP",
            "VAR_SAMP",
            "WIDTH_BUCKET",
            "CREATE TABLE",
            "INSERT INTO",
            "PRIMARY KEY",
            "FOREIGN KEY",
            "NOT NULL",
            "ALTER TABLE",
            "ADD CONSTRAINT",
            "GROUPING SETS",
            "ON OVERFLOW",
            "CHARACTER SET",
            "RESPECT NULLS",
            "IGNORE NULLS",
            "NULLS FIRST",
            "NULLS LAST",
            "DEPTH FIRST",
            "BREADTH FIRST",
            "ABS",
            "ACOS",
            "ALL",
            "ALLOCATE",
            "ALTER",
            "AND",
            "ANY",
            "ARE",
            "ARRAY",
            "ARRAY_AGG",
            "ARRAY_MAX_CARDINALITY",
            "AS",
            "ASENSITIVE",
            "ASIN",
            "ASYMMETRIC",
            "AT",
            "ATAN",
            "ATOMIC",
            "AUTHORIZATION",
            "AVG",
            "BEGIN",
            "BEGIN_FRAME",
            "BEGIN_PARTITION",
            "BETWEEN",
            "BIGINT",
            "BINARY",
            "BLOB",
            "BOOLEAN",
            "BOTH",
            "BY",
            "CALL",
            "CALLED",
            "CARDINALITY",
            "CASCADED",
            "CASE",
            "CAST",
            "CEIL",
            "CEILING",
            "CHAR",
            "CHAR_LENGTH",
            "CHARACTER",
            "CHARACTER_LENGTH",
            "CHECK",
            "CLASSIFIER",
            "CLOB",
            "CLOSE",
            "COALESCE",
            "COLLATE",
            "COLLECT",
            "COLUMN",
            "COMMIT",
            "CONDITION",
            "CONNECT",
            "CONSTRAINT",
            "CONTAINS",
            "CONVERT",
            "COPY",
            "CORR",
            "CORRESPONDING",
            "COS",
            "COSH",
            "COUNT",
            "COVAR_POP",
            "COVAR_SAMP",
            "CREATE",
            "CROSS",
            "CUBE",
            "CUME_DIST",
            "CURRENT",
            "CURRENT_CATALOG",
            "CURRENT_DATE",
            "CURRENT_DEFAULT_TRANSFORM_GROUP",
            "CURRENT_PATH",
            "CURRENT_ROLE",
            "CURRENT_ROW",
            "CURRENT_SCHEMA",
            "CURRENT_TIME",
            "CURRENT_TIMESTAMP",
            "CURRENT_PATH",
            "CURRENT_ROLE",
            "CURRENT_TRANSFORM_GROUP_FOR_TYPE",
            "CURRENT_USER",
            "CURSOR",
            "CYCLE",
            "DATE",
            "DAY",
            "DEALLOCATE",
            "DEC",
            "DECIMAL",
            "DECFLOAT",
            "DECLARE",
            "DEFAULT",
            "DEFINE",
            "DELETE",
            "DENSE_RANK",
            "DEREF",
            "DESCRIBE",
            "DETERMINISTIC",
            "DISCONNECT",
            "DISTINCT",
            "DOUBLE",
            "DROP",
            "DYNAMIC",
            "EACH",
            "ELEMENT",
            "ELSE",
            "EMPTY",
            "END",
            "END_FRAME",
            "END_PARTITION",
            "END-EXEC",
            "EQUALS",
            "ESCAPE",
            "EVERY",
            "EXCEPT",
            "EXEC",
            "EXECUTE",
            "EXISTS",
            "EXP",
            "EXTERNAL",
            "EXTRACT",
            "FALSE",
            "FETCH",
            "FILTER",
            "FIRST_VALUE",
            "FLOAT",
            "FLOOR",
            "FOR",
            "FOREIGN",
            "FRAME_ROW",
            "FREE",
            "FROM",
            "FULL",
            "FUNCTION",
            "FUSION",
            "GET",
            "GLOBAL",
            "GRANT",
            "GROUP",
            "GROUPING",
            "GROUPS",
            "HAVING",
            "HOLD",
            "HOUR",
            "IDENTITY",
            "IN",
            "INDICATOR",
            "INITIAL",
            "INNER",
            "INOUT",
            "INSENSITIVE",
            "INSERT",
            "INT",
            "INTEGER",
            "INTERSECT",
            "INTERSECTION",
            "INTERVAL",
            "INTO",
            "IS",
            "JOIN",
            "JSON_ARRAY",
            "JSON_ARRAYAGG",
            "JSON_EXISTS",
            "JSON_OBJECT",
            "JSON_OBJECTAGG",
            "JSON_QUERY",
            "JSON_TABLE",
            "JSON_TABLE_PRIMITIVE",
            "JSON_VALUE",
            "LAG",
            "LANGUAGE",
            "LARGE",
            "LAST_VALUE",
            "LATERAL",
            "LEAD",
            "LEADING",
            "LEFT",
            "LIKE",
            "LIKE_REGEX",
            "LISTAGG",
            "LN",
            "LOCAL",
            "LOCALTIME",
            "LOCALTIMESTAMP",
            "LOG",
            "LOG10",
            "LOWER",
            "MATCH",
            "MATCH_NUMBER",
            "MATCH_RECOGNIZE",
            "MATCHES",
            "MAX",
            "MEMBER",
            "MERGE",
            "METHOD",
            "MIN",
            "MINUTE",
            "MOD",
            "MODIFIES",
            "MODULE",
            "MONTH",
            "MULTISET",
            "NATIONAL",
            "NATURAL",
            "NCHAR",
            "NCLOB",
            "NEW",
            "NO",
            "NONE",
            "NORMALIZE",
            "NOT",
            "NTH_VALUE",
            "NTILE",
            "NULL",
            "NULLIF",
            "NUMERIC",
            "OCTET_LENGTH",
            "OCCURRENCES_REGEX",
            "OF",
            "OFFSET",
            "OLD",
            "OMIT",
            "ON",
            "ONE",
            "ONLY",
            "OPEN",
            "OR",
            "ORDER",
            "OUT",
            "OUTER",
            "OVER",
            "OVERLAPS",
            "OVERLAY",
            "PARAMETER",
            "PARTITION",
            "PATTERN",
            "PER",
            "PERCENT",
            "PERCENT_RANK",
            "PERCENTILE_CONT",
            "PERCENTILE_DISC",
            "PERIOD",
            "PORTION",
            "POSITION",
            "POSITION_REGEX",
            "POWER",
            "PRECEDES",
            "PRECISION",
            "PREPARE",
            "PRIMARY",
            "PROCEDURE",
            "PTF",
            "RANGE",
            "RANK",
            "READS",
            "REAL",
            "RECURSIVE",
            "REF",
            "REFERENCES",
            "REFERENCING",
            "REGR_AVGX",
            "REGR_AVGY",
            "REGR_COUNT",
            "REGR_INTERCEPT",
            "REGR_R2",
            "REGR_SLOPE",
            "REGR_SXX",
            "REGR_SXY",
            "REGR_SYY",
            "RELEASE",
            "RESULT",
            "RETURN",
            "RETURNS",
            "REVOKE",
            "RIGHT",
            "ROLLBACK",
            "ROLLUP",
            "ROW",
            "ROW_NUMBER",
            "ROWS",
            "RUNNING",
            "SAVEPOINT",
            "SCOPE",
            "SCROLL",
            "SEARCH",
            "SECOND",
            "SEEK",
            "SELECT",
            "SENSITIVE",
            "SESSION_USER",
            "SET",
            "SHOW",
            "SIMILAR",
            "SIN",
            "SINH",
            "SKIP",
            "SMALLINT",
            "SOME",
            "SPECIFIC",
            "SPECIFICTYPE",
            "SQL",
            "SQLEXCEPTION",
            "SQLSTATE",
            "SQLWARNING",
            "SQRT",
            "START",
            "STATIC",
            "STDDEV_POP",
            "STDDEV_SAMP",
            "SUBMULTISET",
            "SUBSET",
            "SUBSTRING",
            "SUBSTRING_REGEX",
            "SUCCEEDS",
            "SUM",
            "SYMMETRIC",
            "SYSTEM",
            "SYSTEM_TIME",
            "SYSTEM_USER",
            "TABLE",
            "TABLESAMPLE",
            "TAN",
            "TANH",
            "THEN",
            "TIME",
            "TIMESTAMP",
            "TIMEZONE_HOUR",
            "TIMEZONE_MINUTE",
            "TO",
            "TRAILING",
            "TRANSLATE",
            "TRANSLATE_REGEX",
            "TRANSLATION",
            "TREAT",
            "TRIGGER",
            "TRIM",
            "TRIM_ARRAY",
            "TRUE",
            "TRUNCATE",
            "UESCAPE",
            "UNION",
            "UNIQUE",
            "UNKNOWN",
            "UNNEST",
            "UPDATE",
            "UPPER",
            "USER",
            "USING",
            "VALUE",
            "VALUES",
            "VALUE_OF",
            "VAR_POP",
            "VAR_SAMP",
            "VARBINARY",
            "VARCHAR",
            "VARYING",
            "VERSIONING",
            "WHEN",
            "WHENEVER",
            "WHERE",
            "WIDTH_BUCKET",
            "WINDOW",
            "WITH",
            "WITHIN",
            "WITHOUT",
            "YEAR",
            "ADD",
            "ASC",
            "COLLATION",
            "DESC",
            "FINAL",
            "FIRST",
            "LAST",
            "VIEW"
        ];
        this.fileService = new FileService();
        this.debounce = debounce;
        this.WORD_SUGGESTION_THROTTLE_MILLISECONDS = 300;
        this.selectionText = null;
        this.occurrence = -1;
        this.x = -1;
        this.y = -1;
        this.suggestion = '';
        this.input = '';
        this.newInput = false;
        this.scrollY = 0;
        this.onSourceHasNewInput = () => {
            this.newInput = true;
        };
        this.processSourceHasNewInput = this.debounce(() => this.onSourceHasNewInput(), this.WORD_SUGGESTION_THROTTLE_MILLISECONDS);
        this.CHECK_DIRTY_INTERVAL = 300;
        this.onDataChanged = () => {
            this.suggestion = '';
            this.input = '';
        }
        this.onSuggestionDismiss = () => {
            this.suggestion = '';
            detectChanges();
        }
    }

    slOnInit() {
        const state = getState();
        const sub = state.getSourceHasNewInputSubject();
        if (!sub.getHasSubscription(this.processSourceHasNewInput)) {
            sub.subscribe(this.processSourceHasNewInput);
        }

        const dataSub = state.getDataSubject();
        if (!dataSub.getHasSubscription(this.onDataChanged)) {
            dataSub.subscribe(this.onDataChanged);
        }

        const dismissSubject = state.getDismissSuggestionSubject();
        if (!dismissSubject.getHasSubscription(this.onSuggestionDismiss)) {
            dismissSubject.subscribe(this.onSuggestionDismiss);
        }

        setInterval(() => {
            const textAreaEle = document.getElementById('tryit-sling-div');

            if (textAreaEle && this.newInput) {
                const selectionEnd = getCaretPosition(textAreaEle);
                if (textAreaEle) {
                    this.selectionText = textAreaEle.textContent.slice(selectionEnd - 16, selectionEnd);
                    this.occurrence = this.countOccurrences(textAreaEle.textContent, this.selectionText);

                    const state = getState();
                    const fileIndex = state.getEditIndex();
                    const fileData = this.fileService.getFileData(fileIndex);

                    const selectionIndices = this.getIndicesOf(this.selectionText, fileData, true);
                    const index = selectionIndices[this.occurrence - 1];

                    let after = fileData.substring(index);
                    after = after.substring(0, this.selectionText.length);

                    if (after && after.includes('<')) {
                        this.input = after.substring(after.lastIndexOf('<') + 1);
                        this.input = this.input.trim();

                        if (this.input.includes(' ')) {
                            this.input = after.substring(after.lastIndexOf(' ') + 1);
                            this.input = this.input.trim();
                        }

                        if (this.input.includes('\n')) {
                            this.input = after.substring(after.lastIndexOf('\n') + 1);
                            this.input = this.input.trim();
                        }

                        this.determineSuggestionIfPossible(fileData, index, textAreaEle);
                    } else if (after && after.includes(' ')) {
                        this.input = after.substring(after.lastIndexOf(' ') + 1);
                        this.input = this.input.trim();

                        if (this.input.includes('\n')) {
                            this.input = after.substring(after.lastIndexOf('\n') + 1);
                            this.input = this.input.trim();
                        }

                        this.determineSuggestionIfPossible(fileData, index, textAreaEle);
                    } else if (after && after.includes('\n')) {
                        this.input = after.substring(after.lastIndexOf('\n') + 1);
                        this.input = this.input.trim();

                        this.determineSuggestionIfPossible(fileData, index, textAreaEle);
                    } else {
                        this.input = after;
                        this.determineSuggestionIfPossible(fileData, index, textAreaEle);
                    }
                }

                this.newInput = false;
            }
        }, this.CHECK_DIRTY_INTERVAL);

        document.addEventListener('keydown', this.onDocumentKeyDown.bind(this));
    }

    slAfterInit() {
        this.attachScrollListener();
    }

    getTextWidth(text, font) {
        const canvas = this.getTextWidth.canvas || (this.getTextWidth.canvas = document.createElement("canvas"));
        const context = canvas.getContext("2d");
        context.font = font;
        const metrics = context.measureText(text);
        return metrics.width;
    }

    attachScrollListener() {
        const slingTextArea = document.getElementById('tryit-sling-div');
        if (slingTextArea) {
            slingTextArea.addEventListener("scroll", function (textArea, event) {
                this.updateScrollY(textArea);
            }.bind(this, slingTextArea), false);
        }
    }

    updateScrollY(textArea) {
        this.scrollY = textArea.scrollTop;

        const state = getState();
        state.getDismissSuggestionSubject().next(true);
        setState(state);
    }

    determineSuggestionIfPossible(fileData, index, textAreaEle) {
        if (this.input.startsWith('{')) {
            this.input = this.input.substring(this.input.indexOf('{') + 1);
            this.input = this.input.trim();
        }

        const uppercaseInput = this.input.toUpperCase();

        if (this.input && this.input.length > 0) {
            const freqMap = this.buildWordFrequencyMap(fileData);

            let suggestionRank = 0;

            for (const key of Object.keys(freqMap)) {
                if (key.startsWith(this.input) && key !== this.input && freqMap[key] > suggestionRank) {
                    suggestionRank = freqMap[key];
                    this.suggestion = key;
                } else if (key.startsWith(uppercaseInput) && key !== uppercaseInput && freqMap[key] > suggestionRank) {
                    suggestionRank = freqMap[key];
                    this.suggestion = key;
                }
            }

            if (this.suggestion && this.suggestion.length > 0) {
                if (this.suggestion === this.input) {
                    this.suggestion = null;
                    detectChanges();
                } else {
                    const currentPos = getCaretPosition(textAreaEle);
                    const caret = getCaretCoordinates(textAreaEle, currentPos);

                    if (caret) {
                        const lineHeight = this.getLineHeight(textAreaEle);

                        this.x = caret.left;

                        const state = getState();
                        let font = '400 13.3333px Arial';

                        if (state.getLowResolution()) {
                            font = '400 20px Arial';
                        }

                        const textWidth = this.getTextWidth(this.suggestion, font);

                        if (this.x + textWidth > window.outerWidth) {
                            this.x -= textWidth;
                            this.x -= this.convertRemToPixels(0.5);
                        }

                        this.y = caret.top - lineHeight - this.convertRemToPixels(0.5);

                        if (textAreaEle.scrollTop > 0) {
                            this.y -= textAreaEle.scrollTop;
                        }

                        detectChanges();
                    }
                }
            }
        }
    }

    convertRemToPixels(rem) {
        return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
    }

    getLineHeight(el) {
        const temp = document.createElement(el.nodeName);
        let ret;
        temp.setAttribute('style', 'margin:0; padding:0; '
            + 'font-family:' + (el.style.fontFamily || 'inherit') + '; '
            + 'font-size:' + (el.style.fontSize || 'inherit'));
        temp.innerHTML = 'A';

        el.parentNode.appendChild(temp);
        ret = temp.clientHeight;
        temp.parentNode.removeChild(temp);

        return ret;
    }

    buildWordFrequencyMap(string) {
        let words = [];
        let word = '';

        for (let i = 0; i < string.length; ++i) {
            if (string[i] !== '\n' && string[i] !== ' ' && string[i] !== '(' && string[i] !== '{' && string[i] !== ';') {
                word += string[i];
            } else if (word.length > 0) {
                const trimmed = word.trim();
                if (trimmed.length > 0) {
                    words.push(trimmed);
                }
                word = '';
            }
        }

        words = words.concat(this.SQLITE_KEYWORDS_AND_PHRASES);

        const freqMap = {};
        words.forEach(function (w) {
            if (w === 'constructor') {
                let data = '' + freqMap[w];

                if (!data) {
                    freqMap[w] = 1;
                } else if (typeof data === 'string' && data.includes('}')) {
                    data = data.substring(data.lastIndexOf('}') + 1).trim();
                    const newVal = Number(data) + 1;
                    freqMap[w] = newVal;
                } else {
                    freqMap[w] += 1;
                }
            } else {
                if (!freqMap[w]) {
                    freqMap[w] = 0;
                }
                freqMap[w] += 1;
            }
        });

        return freqMap;
    }

    countOccurrences(string, subString, allowOverlapping = false) {
        string += "";
        subString += "";
        if (subString.length <= 0) return (string.length + 1);

        var n = 0,
            pos = 0,
            step = allowOverlapping ? 1 : subString.length;

        while (true) {
            pos = string.indexOf(subString, pos);
            if (pos >= 0) {
                ++n;
                pos += step;
            } else break;
        }
        return n;
    }

    getIndicesOf(searchStr, str, caseSensitive) {
        const searchStrLen = searchStr.length;
        if (searchStrLen == 0) {
            return [];
        }
        let startIndex = 0, index, indices = [];
        if (!caseSensitive) {
            str = str.toLowerCase();
            searchStr = searchStr.toLowerCase();
        }
        while ((index = str.indexOf(searchStr, startIndex)) > -1) {
            indices.push(index);
            startIndex = index + searchStrLen;
        }
        return indices;
    }

    onDocumentKeyDown(event) {
        if (event && event.keyCode === 9) {
            event.preventDefault();
            this.insertTab();
        } else if (this.suggestion && this.suggestion.length > 0 && this.input && this.input.length > 0) {
            if (event && (event.ctrlKey || event.metaKey) && event.keyCode === 65) {
                event.preventDefault();
                this.insertSuggestion();
            }
        }
    }

    insertTab() {
        const state = getState();
        const fileIndex = state.getEditIndex();
        const fileData = this.fileService.getFileData(fileIndex);

        const textAreaEle = document.getElementById('tryit-sling-div');
        const selectionEnd = getCaretPosition(textAreaEle);

        let before = fileData.substring(0, selectionEnd);
        let charsInserted = 4;

        let after = fileData.substring(selectionEnd);
        if (after === '' && before.endsWith('\n')) {
            before = before.substring(0, before.length - 1);
            charsInserted--;
        }

        after = '    ' + after;

        this.fileService.updateFileData(fileIndex, before + after);
        state.setCaretPositionToRestore(selectionEnd + charsInserted);

        this.suggestion = null;
        this.input = null;

        const sub = state.getDataSubject();
        sub.next(true);
    }

    insertSuggestion() {
        const state = getState();
        const fileIndex = state.getEditIndex();
        const fileData = this.fileService.getFileData(fileIndex);

        const textAreaEle = document.getElementById('tryit-sling-div');
        const selectionEnd = getCaretPosition(textAreaEle);

        let before = fileData.substring(0, selectionEnd);
        const inputLocation = before.lastIndexOf(this.input);
        if (inputLocation >= 0) {
            const beforeInput = before.substring(0, inputLocation);
            const afterInput = before.substring(inputLocation + this.input.length);
            before = beforeInput + afterInput;
        }

        let after = fileData.substring(selectionEnd);
        after = this.suggestion + after;

        this.fileService.updateFileData(fileIndex, before + after);
        state.setCaretPositionToRestore(selectionEnd + (this.suggestion.length - this.input.length));

        this.suggestion = null;
        this.input = null;

        const sub = state.getDataSubject();
        sub.next(true);
    }

    view() {
        const state = getState();

        let font = ' font: 400 13.3333px Arial;';

        if (state.getLowResolution()) {
            font = ' font: 400 20px Arial;';
        }

        let leftAndTopAndDisplay = 'left: ' + this.x + 'px; top: ' + this.y + 'px;';

        if (!this.suggestion || this.suggestion.length === 0) {
            leftAndTopAndDisplay += ' display: none;';
        }

        return markup('div', {
            attrs: {
                id: 'tryit-sling-suggestion',
                style: leftAndTopAndDisplay + 'position: fixed; padding: 0.25rem; background-color: rgb(60, 68, 83); color: rgb(204, 204, 204); z-index: 1000;' + font,
                onclick: this.insertSuggestion.bind(this),
                onmousedown: (pointerEvent) => { pointerEvent.preventDefault(); pointerEvent.stopPropagation(); }
            },
            children: [
                textNode(this.suggestion)
            ]
        });
    }
}

export default WordSuggestionComponent;
