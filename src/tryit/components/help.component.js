import { markup, textNode, getState, mount, setState } from '../../../dist/sling.min';
import ResetDialogComponent from './reset-dialog.component';

class HelpComponent {

    constructor() {
    }

    onReset() {
        mount('tryit-sling-reset', new ResetDialogComponent(), s.CHANGE_DETECTOR_DETACHED);
    }

    onToggleLowResolution() {
        const state = getState();
        const isLowResolution = state.getLowResolution();
        state.setManualLowResolution(!isLowResolution);
        setState(state);
    }

    view() {
        const state = getState();

        let font = ' font: 400 13.3333px Arial;';

        if (state.getLowResolution()) {
            font = ' font: 400 20px Arial;';
        }
        
        const isLowResolution = state.getLowResolution();

        return markup('div', {
            attrs: {
                style: 'padding: 0.25rem; background-color: rgb(21, 24, 30); color: rgb(204, 204, 204); overflow: auto; height: calc(100% - 0.5rem); display: flex; flex-direction: column;'
            },
            children: [
                markup('div', {
                    attrs: {
                        style: 'flex: 20; padding: 1rem;'
                    },
                    children: [
                        markup('h4', {
                            attrs: {
                                style: 'margin: 0px;'
                            },
                            children: [
                                textNode('Cloud SQLite Help')
                            ]
                        }),
                        markup('p', {
                            children: [
                                textNode('SQLite databases are temporary and are destroyed on browser tab refresh.')
                            ]
                        }),
                        markup('p', {
                            children: [
                                textNode('Click Export to export all SQLite database table, views, and table content.')
                            ]
                        }),
                        markup('p', {
                            children: [
                                textNode('Press Control/Command and J simultaneously to format your code. Press Control/Command and M simultaneously to run your code.')
                            ]
                        }),
                        markup('p', {
                            children: [
                                textNode('To reset Cloud SQLite to original state, click the following button.'),
                            ]
                        }),
                        markup('div', {
                            children: [
                                markup('button', {
                                    attrs: {
                                        onclick: this.onReset.bind(this),
                                        style: 'background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); align-self: center;' + font
                                    },
                                    children: [
                                        textNode('Reset')
                                    ]
                                })
                            ]
                        }),
                        markup('p', {
                            children: [
                                textNode('To switch between normal and low resolution mode, click the following toggle.'),
                            ]
                        }),
                        markup('div', {
                            children: [
                                textNode('Low Resolution: '),
                                markup('input', {
                                    attrs: {
                                        id: 'low-resolution-checkbox',
                                        type: 'checkbox',
                                        ...isLowResolution && { checked: 'true' },
                                        onchange: this.onToggleLowResolution.bind(this)
                                    }
                                })
                            ]
                        }),
                        markup('p', {
                            children: [
                                textNode('If you encounter any issues, please log an issue on GitHub: '),
                                markup('a', {
                                    attrs: {
                                        href: 'https://github.com/puckowski/Cloud-SQLite'
                                    },
                                    children: [
                                        textNode('https://github.com/puckowski/Cloud-SQLite')
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        });
    }
}

export default HelpComponent;
