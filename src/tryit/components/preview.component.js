import { detectChanges, getState, markup, textNode } from '../../../dist/sling.min';
import FileService from '../services/file.service';
import { debounce } from '../services/throttle.service';
import { slGet } from '../../../dist/sling-xhr.min';
import ExportService from '../services/export.service';

class PreviewComponent {

    constructor() {
        this.fileService = new FileService();
        this.injectedList = '';
        this.isPreviewLoading = false;
        this.lessScriptData = null;
        this.nessScriptData = null;
        this.STANDARD_DELAY_MILLISECONDS = 300;
        this.debounce = debounce;
        this.debouncedFileChangeFunction = null;
        this.sqlWorker = new Worker('sqlite.worker.js?sqlite3.dir=wasm');
        this.resultHistory = [];
        this.waterCss = null;
        this.exportService = new ExportService();
        this.sqlWorker.onmessage = ({ data }) => {
            const state = getState();

            const collapsedMode = state.getCollapsedMode();
            const showPreview = state.getShowPreview();

            if (collapsedMode && !showPreview) {
                return;
            }

            let iframe = document.getElementById('tryit-sling-iframe');

            if (iframe === null) {
                return;
            }

            const newIFrame = document.createElement('iframe');
            let originalIFrame = iframe;

            newIFrame.style = iframe.style;
            iframe.parentElement.replaceChild(newIFrame, iframe);
            iframe = newIFrame;
            originalIFrame = null;

            const htmlContainer = (iframe.contentWindow) ? iframe.contentWindow : (iframe.contentDocument.document) ? iframe.contentDocument.document : iframe.contentDocument;

            htmlContainer.document.open();

            for (const priorResult of this.resultHistory) {
                this.printResult(priorResult, htmlContainer);
            }
            this.printResult(data, htmlContainer);

            if (!data.expot) {
                this.resultHistory.push(data);
            }

            if ((data && data !== '') || this.resultHistory.length > 0) {
                if (this.waterCss === null) {
                    slGet('water.css').then(xhrResp => {
                        this.waterCss = xhrResp.response;

                        const style = document.createElement('style');
                        style.textContent = this.waterCss;

                        htmlContainer.document.head.appendChild(style);
                    });
                } else {
                    const style = document.createElement('style');
                    style.textContent = this.waterCss;

                    htmlContainer.document.head.appendChild(style);
                }
            }

            htmlContainer.document.close();

            detectChanges();
        };
        this.onFileChangeFunction = () => {
            const state = getState();
            const fileIndex = state.getEditIndex();
            const sql = this.fileService.getFileData(fileIndex);

            const sqlQueries = this.splitSql(sql);

            for (const sqlQuery of sqlQueries) {
                this.sqlWorker.postMessage({ sql: sqlQuery });
            }
        };
        this.onExportSqlFunction = () => {
            this.sqlWorker.postMessage({ export: true });
        };
        this.onClearResults = () => {
            this.resultHistory = [];
            detectChanges();
        };
    }

    slAfterInit() {
        const state = getState();
        const sub = state.getDataSubject();
        this.debouncedFileChangeFunction = this.debounce(this.onFileChangeFunction, this.STANDARD_DELAY_MILLISECONDS);
        if (!sub.getHasSubscription(this.debouncedFileChangeFunction)) {
            sub.subscribe(this.debouncedFileChangeFunction);
            sub.next(true);
        }

        const subInvalid = state.getInvalidScriptIndexSubject();
        if (!subInvalid.getHasSubscription(this.onInvalidScriptFunction)) {
            subInvalid.subscribe(this.onInvalidScriptFunction);
        }

        const exportSqlSubject = state.getExportSqlSubject();
        if (!exportSqlSubject.getHasSubscription(this.onExportSqlFunction)) {
            exportSqlSubject.subscribe(this.onExportSqlFunction);
        }

        const clearResultsSubject = state.getClearResultsSubject();
        if (!clearResultsSubject.getHasSubscription(this.onClearResults)) {
            clearResultsSubject.subscribe(this.onClearResults);
        }
        this.resultHistory = [];
    }

    slOnDestroy() {
        const state = getState();
        const sub = state.getDataSubject();
        if (sub.getHasSubscription(this.debouncedFileChangeFunction)) {
            sub.clearSubscription(this.debouncedFileChangeFunction);
        }

        const subInvalid = state.getInvalidScriptIndexSubject();
        if (subInvalid.getHasSubscription(this.onInvalidScriptFunction)) {
            subInvalid.clearSubscription(this.onInvalidScriptFunction);
        }

        const exportSqlSubject = state.getExportSqlSubject();
        if (exportSqlSubject.getHasSubscription(this.onExportSqlFunction)) {
            exportSqlSubject.clearSubscription(this.onExportSqlFunction);
        }

        const clearResultsSubject = state.getClearResultsSubject();
        if (clearResultsSubject.getHasSubscription(this.onClearResults)) {
            clearResultsSubject.clearSubscription(this.onClearResults);
        }
    }

    clearResults() {
        const iframe = document.getElementById('tryit-sling-iframe');
        const htmlContainer = (iframe.contentWindow) ? iframe.contentWindow : (iframe.contentDocument.document) ? iframe.contentDocument.document : iframe.contentDocument;

        htmlContainer.document.open();
        htmlContainer.document.close();

        this.resultHistory = [];

        detectChanges();
    }

    printResult(result, htmlContainer) {
        let tableCreated = false;
        let logPrinted = false;
        let isExport = false;

        if (result.log) {
            htmlContainer.document.write(result.log ? result.log : result);
            htmlContainer.document.write('<hr>');
            logPrinted = true;
        } else if (result.export) {
            this.exportService.downloadFile('sqlite.sql', result.export);
            isExport = true;
        } else if (result.ready) {
            htmlContainer.document.write(result.ready ? result.ready : result);
            htmlContainer.document.write('<hr>');
            logPrinted = true;

            const state = getState();
            state.getSqliteReadySubject().next(true);

            detectChanges();
        }

        try {
            const arr = JSON.parse(result);

            if (Array.isArray(arr) && arr.length > 0) {
                tableCreated = true;

                const first = arr[0];
                const keys = Object.keys(first);

                let tableHtml = '<table><thead><th>';
                for (let index = 0; index < keys.length; ++index) {
                    if (index > 0) {
                        tableHtml += '</th><th>';
                    }
                    tableHtml += keys[index];
                }
                tableHtml += '</tr></thead><tbody>';
                for (let dataIndex = 0; dataIndex < arr.length; ++dataIndex) {
                    tableHtml += '<tr><td>';
                    for (let index = 0; index < keys.length; ++index) {
                        if (index > 0) {
                            tableHtml += '</td><td>';
                        }
                        tableHtml += arr[dataIndex][keys[index]];
                    }
                    tableHtml += '</td></tr>';
                }
                tableHtml += '</tbody></table>';

                htmlContainer.document.write(tableHtml);
            }
        } catch (e) {
        }

        if (!tableCreated && !logPrinted && !isExport) {
            htmlContainer.document.write(result.log ? result.log : result);
            htmlContainer.document.write('<hr>');
        }
    }

    splitSql(inputSql) {
        let parts = [];
        let currentPart = '';
        let insideQuotes = false;
        let quoteType = '';

        for (let i = 0; i < inputSql.length; i++) {
            const char = inputSql[i];

            if (char === ';' && !insideQuotes) {
                parts.push(currentPart.trim());
                currentPart = '';
            } else if (char === '"' || char === "'") {
                insideQuotes = !insideQuotes;
                quoteType = char;
                currentPart += char;
            } else {
                currentPart += char;
            }

            if (insideQuotes && char === quoteType && currentPart.endsWith('\\')) {
                insideQuotes = false;
            }
        }

        if (currentPart.trim() !== '') {
            parts.push(currentPart.trim());
        }

        return parts;
    }

    addFile() {
        this.fileService.addFile();
    }

    view() {
        const state = getState();

        let font = ' font: 400 13.3333px Arial;';

        if (state.getLowResolution()) {
            font = ' font: 400 20px Arial;';
        }

        return markup('div', {
            attrs: {
                style: 'padding: 0.25rem; color: rgb(204, 204, 204); max-height: inherit; overflow: auto; display: flex; flex-direction: column; height: calc(100% - 0.5rem);'
            },
            children: [
                markup('h4', {
                    attrs: {
                        style: 'margin: 0px; flex-shrink: 1;'
                    },
                    children: [
                        ...(!this.isPreviewLoading ? textNode('Results') : []),
                        ...(this.isPreviewLoading ? textNode('Loading...') : [])
                    ]
                }),
                markup('iframe', {
                    attrs: {
                        frameborder: '0',
                        id: 'tryit-sling-iframe',
                        sldirective: 'onlyself',
                        style: 'background-color: #ffffff; width: 100%; flex: 15;'
                    }
                })
            ]
        });
    }
}

export default PreviewComponent;
