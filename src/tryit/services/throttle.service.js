export const debounce = (func, wait) => {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = s.DETACHED_SET_TIMEOUT(() => func.apply(context, args), wait);
    }
}
