import { detectChanges, getState, markup, setState, textNode } from '../../../dist/sling.min';
import FileService from '../services/file.service';

class NavbarComponent {

    constructor() {
        this.fileService = new FileService();
        this.NAVBAR_VH_TARGET = 40;
        this.NAVBAR_PIXEL_HEIGHT_MAX = 240;
    }

    slAfterInit() {
        document.addEventListener('keydown', function (event) {
            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
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

        s.DETACHED_SET_TIMEOUT(() => {
            state.getDataSubject().next(true);
        }, 0);

        setState(state);
    }

    onRun() {
        const state = getState();
        state.getDataSubject().next(true);
    }

    onClearResults() {
        const iframe = document.getElementById('tryit-sling-iframe');
        const htmlContainer = (iframe.contentWindow) ? iframe.contentWindow : (iframe.contentDocument.document) ? iframe.contentDocument.document : iframe.contentDocument;

        htmlContainer.document.open();
        htmlContainer.document.close();

        const state = getState();
        state.getClearResultsSubject().next(true);
        
        detectChanges();
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
            s.DETACHED_SET_TIMEOUT(() => {
                state.getDataSubject().next(true);
            }, 0);
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

        s.DETACHED_SET_TIMEOUT(() => {
            state.getDataSubject().next(true);
        }, 0);

        setState(state);
        detectChanges();
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
            font = ' font: 400 26px Arial;';
            padding = ' padding: 2px 12px;';
            marginBottom = ' margin-bottom: 0.75rem;';
            marginRight = ' margin-right: 0.75rem;';
            headerPadding = ' padding: 1rem 0.5rem 0.25rem 0.5rem;';
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
            padding = ' padding: 12px 12px;';
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
                        onclick: this.onHelpToggle.bind(this),
                        style: marginBottom + ' background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); ' + marginRight + '  ' + font + padding
                    },
                    children: [
                        textNode('Toggle Help')
                    ]
                }),
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
            ]
        });
    }
}

export default NavbarComponent;
