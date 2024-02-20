
const isBrowser = (typeof window !== 'undefined');

export function getCaretCoordinates(element, position, options) {
    if (!isBrowser) {
        throw new Error('getCaretCoordinates should only be called in a browser');
    }

    const computed = window.getComputedStyle ? window.getComputedStyle(element) : element.currentStyle;  // currentStyle for IE < 9

    // Get the selection object
    const selection = window.getSelection();

    if (selection.rangeCount > 0) {
        // Get the range of the selection
        const range = selection.getRangeAt(0);

        // Create a new range to collapse it to the end of the current selection
        const newRange = range.cloneRange();
        const editableDiv = document.getElementById('tryit-sling-div');
        newRange.selectNodeContents(editableDiv);
        newRange.setStart(range.endContainer, range.endOffset);

        // Create a dummy span to get the position of the caret
        const dummySpan = document.createElement("span");
        newRange.insertNode(dummySpan);

        // Get the position of the dummy span
        const caretPosition = {
            left: dummySpan.offsetLeft + editableDiv.offsetLeft,
            top: dummySpan.offsetTop + editableDiv.offsetTop,
            height: parseInt(computed['lineHeight'])
        };

        // Remove the dummy span
        dummySpan.parentNode.removeChild(dummySpan);

        return caretPosition;
    }
}

if (typeof module != 'undefined' && typeof module.exports != 'undefined') {
    module.exports = getCaretCoordinates;
} else if (isBrowser) {
    window.getCaretCoordinates = getCaretCoordinates;
}

export function getCaretPosition(element) {
    let position = 0;
    const isSupported = typeof window.getSelection !== "undefined";
    if (isSupported) {
        const selection = window.getSelection();
        if (selection.rangeCount !== 0) {
            const range = window.getSelection().getRangeAt(0);
            const preCaretRange = range.cloneRange();
            
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);

            const textWithNewlines = preCaretRange.toString();
            if (textWithNewlines) {
                position = textWithNewlines.length;// + (textWithNewlines.split('\n').length - 1);
            } else {
                position = 0;
            }
        }
    }
    return position;
}
