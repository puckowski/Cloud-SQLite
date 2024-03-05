import { detectChanges, getState, markup, setState, textNode } from '../../../dist/sling.min';
import FileService from '../services/file.service';
import { getCaretPosition } from '../services/caret.service';

class NavbarComponent {

    constructor() {
        this.fileService = new FileService();
        this.NAVBAR_VH_TARGET = 40;
        this.NAVBAR_PIXEL_HEIGHT_MAX = 120;
        this.sqlFormatter = null;
        this.showMoreControls = false;
    }

    slAfterInit() {
        document.addEventListener('keydown', function (event) {
            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case 'j': {
                        event.preventDefault();

                        this.onFormat();

                        break;
                    }
                    case 'm': {
                        event.preventDefault();

                        this.onRun();

                        break;
                    }
                }
            }
        }.bind(this));
    }

    expandHeight() {
        const state = getState();
        let mod = state.getHeightModifier();
        mod += 10;
        state.setHeightModifier(mod);
        setState(state);
    }

    shrinkHeight() {
        const state = getState();
        let mod = state.getHeightModifier();
        mod -= 10;
        state.setHeightModifier(mod);
        setState(state);
    }

    togglePreview() {
        const state = getState();
        state.setShowPreview(!state.getShowPreview());
        state.getDataSubject().next(true);
        setState(state);
        detectChanges();
    }

    onImport(event) {
        if (event && event.target && event.target.files) {
            const file = event.target.files[0];

            if (file) {
                const reader = new FileReader();
                reader.readAsText(file, 'UTF-8');
                reader.onload = (readEvent) => {
                    const state = getState();
                    const existingFileData = this.fileService.getFileData(0);

                    if (existingFileData === '' || existingFileData === '\n') {
                        this.fileService.updateFileData(0, readEvent.target.result);
                    } else {
                        this.fileService.updateFileData(0, this.fileService.getFileData(0) + '\n' + readEvent.target.result);
                    }

                    state.getDataSubject().next(true);
                };
            }
        }

        if (event && event.target) {
            event.target.value = '';
        }
    }

    onDemo() {
        this.fileService.buildDemo();
        const state = getState();
        state.getDataSubject().next(true);
        detectChanges();
    }

    onRun() {
        const state = getState();
        state.getDataSubject().next({ run: true });
    }

    onClearResults() {
        const iframe = document.getElementById('tryit-sling-iframe');

        if (iframe) {
            const htmlContainer = (iframe.contentWindow) ? iframe.contentWindow : (iframe.contentDocument.document) ? iframe.contentDocument.document : iframe.contentDocument;

            htmlContainer.document.open();
            htmlContainer.document.close();

            const state = getState();
            state.getClearResultsSubject().next(true);

            detectChanges();
        }
    }

    onExport() {
        const state = getState();
        const exportSqlSubject = state.getExportSqlSubject();
        exportSqlSubject.next(true);
    }

    removeLastOccurrence(textToReplace, str) {
        const charpos = str.lastIndexOf(textToReplace);

        if (charpos < 0) {
            return str;
        }

        const ptone = str.substring(0, charpos);
        const pttwo = str.substring(charpos + textToReplace.length);

        return (ptone + pttwo);
    }

    onHelpToggle() {
        const state = getState();
        state.setShowHelp(!state.getShowHelp());
        setState(state);

        if (!state.getShowHelp()) {
            state.getDataSubject().next(true);
            detectChanges();
        }
    }

    onToggleMode() {
        const state = getState();

        if (state.getCollapsedMode()) {
            state.setCollapsedMode(false);
            state.setPortraitMode(true);
        } else if (state.getPortraitMode()) {
            state.setCollapsedMode(false);
            state.setPortraitMode(false);
        } else {
            state.setCollapsedMode(true);
        }

        state.getDataSubject().next(true);

        setState(state);
        detectChanges();
    }

    onFormat() {
        const state = getState();
        const fileIndex = state.getEditIndex();
        let code = this.fileService.getFileData(fileIndex);

        if (this.sqlFormatter === null) {
            import(
                '../../js/sql-formatter'
            ).then((module) => {
                this.sqlFormatter = module.format;
                code = this.sqlFormatter(code, { language: 'sqlite' });

                this.fileService.updateFileData(fileIndex, code);

                const sub = state.getDataSubject();
                sub.next(true);

                this.restoreCaretPosition();
            });
        } else {
            code = this.sqlFormatter(code, { language: 'sqlite' });

            this.fileService.updateFileData(fileIndex, code);

            const sub = state.getDataSubject();
            sub.next(true);

            this.restoreCaretPosition();
        }
    }

    restoreCaretPosition() {
        const state = getState();

        const textAreaEle = document.getElementById('tryit-sling-div');
        const caretRestore = getCaretPosition(textAreaEle);

        state.setCaretPositionToRestore(caretRestore);
        setState(state);

        state.getCaretSubject().next(caretRestore);

        detectChanges();
    }

    onToggleShowMore() {
        this.showMoreControls = !this.showMoreControls;
    }

    view() {
        const state = getState();
        const mod = state.getHeightModifier();
        const collapsedMode = state.getCollapsedMode();
        const versionStr = state.getVersion();
        const portraitMode = state.getPortraitMode();
        const lowResolution = state.getLowResolution();
        const sqliteReady = state.getSqliteReady();

        let font = ' font: 400 13.3333px Arial;';
        let padding = ' padding: 1px 6px;';
        let marginBottom = ' margin-bottom: 0.25rem;';
        let marginRight = ' margin-right: 0.25rem;';
        let headerPadding = ' padding: 0.5rem; ';
        let headerMargin = ' margin-bottom: 0.25rem;';
        let headerAlign = '';

        if (lowResolution) {
            font = ' font: 400 20px Arial;';
            padding = ' padding: 1.5px 8px;';
            marginBottom = ' margin-bottom: 0.75rem;';
            marginRight = ' margin-right: 0.75rem;';
            headerPadding = ' padding: 0.5rem 0.5rem 0.25rem 0.5rem;';
            headerMargin = ' margin-top: -0.75rem;';
            headerAlign = ' align-items: center; ';
        }

        if (portraitMode && lowResolution && window.screen.width < window.screen.height) {
            const vh = window.innerHeight / 100;

            let fourtyVhOrMax = vh * this.NAVBAR_VH_TARGET;

            if (fourtyVhOrMax > this.NAVBAR_PIXEL_HEIGHT_MAX) {
                fourtyVhOrMax = this.NAVBAR_PIXEL_HEIGHT_MAX;
            }

            headerAlign += ' min-height: ' + fourtyVhOrMax + 'px; ';
            padding = ' padding: 8px 8px;';
        }

        font += ' font-weight: 900;';

        return markup('div', {
            attrs: {
                style: 'background-color: rgb(46, 49, 56); display: flex; flex-direction: row; flex-wrap: wrap;' + headerPadding + headerAlign
            },
            children: [
                markup('div', {
                    attrs: {
                        style: 'margin-right: 0.5rem; display: inline-block; color: rgb(204, 204, 204); align-self: center;' + headerMargin
                    },
                    children: [
                        markup('h4', {
                            attrs: {
                                style: 'margin: 0px; display: inline-block; margin-right: 0.25rem;' + font
                            },
                            children: [
                                textNode('Cloud SQLite')
                            ]
                        }),
                        markup('span', {
                            attrs: {
                                style: font
                            },
                            children: [
                                textNode(versionStr)
                            ]
                        })
                    ]
                }),
                ...(collapsedMode === true ? [
                    markup('button', {
                        attrs: {
                            onclick: this.togglePreview.bind(this),
                            style: marginBottom + ' background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); ' + marginRight + '  ' + font + padding
                        },
                        children: [
                            textNode('Toggle Preview')
                        ]
                    })
                ] : []),
                markup('button', {
                    attrs: {
                        id: 'tryit-sling-clear-results',
                        onclick: this.onClearResults.bind(this),
                        style: marginBottom + ' background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); ' + marginRight + '  ' + font + padding
                    },
                    children: [
                        textNode('Clear Results')
                    ]
                }),
                markup('button', {
                    attrs: {
                        id: 'tryit-sling-toggle-mode',
                        onclick: this.onToggleMode.bind(this),
                        style: marginBottom + ' background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); ' + marginRight + '  ' + font + padding
                    },
                    children: [
                        textNode('Toggle Mode')
                    ]
                }),
                markup('button', {
                    attrs: {
                        onclick: this.onFormat.bind(this),
                        style: marginBottom + ' background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); ' + marginRight + '  ' + font + padding
                    },
                    children: [
                        textNode('Format')
                    ]
                }),
                ...(sqliteReady ? [
                    markup('button', {
                        attrs: {
                            onclick: this.onRun.bind(this),
                            style: marginBottom + ' background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); ' + marginRight + '  ' + font + padding
                        },
                        children: [
                            textNode('Run')
                        ]
                    }),
                    markup('button', {
                        attrs: {
                            onclick: this.onExport.bind(this),
                            style: marginBottom + ' background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); ' + marginRight + '  ' + font + padding
                        },
                        children: [
                            textNode('Export')
                        ]
                    })
                ] : []),
                ...(this.showMoreControls ? [
                    markup('button', {
                        attrs: {
                            onclick: this.expandHeight.bind(this),
                            style: marginBottom + ' background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); ' + marginRight + '  ' + font + padding
                        },
                        children: [
                            textNode('Expand')
                        ]
                    }),
                    ...(mod > 0 ? [
                        markup('button', {
                            attrs: {
                                onclick: this.shrinkHeight.bind(this),
                                style: marginBottom + ' background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); ' + marginRight + '  ' + font + padding
                            },
                            children: [
                                textNode('Shrink')
                            ]
                        })
                    ] : []),
                    markup('button', {
                        attrs: {
                            onclick: this.onHelpToggle.bind(this),
                            style: marginBottom + ' background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); ' + marginRight + '  ' + font + padding
                        },
                        children: [
                            textNode('Toggle Help')
                        ]
                    }),
                    markup('button', {
                        attrs: {
                            onclick: this.onDemo.bind(this),
                            style: marginBottom + ' background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); ' + marginRight + '  ' + font + padding
                        },
                        children: [
                            textNode('Demo')
                        ]
                    }),
                    markup('label', {
                        attrs: {
                            id: 'try-sling-import-label',
                            for: 'tryit-sling-import',
                            style: marginBottom + ' background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); display: flex; align-items: center; ' + marginRight + '  ' + font + padding,
                        },
                        children: [
                            textNode('Import File')
                        ]
                    }),
                    markup('input', {
                        attrs: {
                            onchange: this.onImport.bind(this),
                            id: 'tryit-sling-import',
                            type: 'file',
                            style: 'display: none;'
                        }
                    }),
                    markup('button', {
                        attrs: {
                            onclick: this.onToggleShowMore.bind(this),
                            style: marginBottom + ' background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); ' + marginRight + '  ' + font + padding
                        },
                        children: [
                            textNode('Less')
                        ]
                    }),
                ] : [
                    markup('button', {
                        attrs: {
                            onclick: this.onToggleShowMore.bind(this),
                            style: marginBottom + ' background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); ' + marginRight + '  ' + font + padding
                        },
                        children: [
                            textNode('More')
                        ]
                    }),
                ]),
            ]
        });
    }
}

export default NavbarComponent;
