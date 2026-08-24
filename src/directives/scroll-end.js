const scrollEnd = {
    mounted(el, binding) {
        el.scrollEndEvent = (event) => {
            const isAtEnd = (el.scrollTop + el.clientHeight) * 1.05 >= el.scrollHeight;
            if (isAtEnd) {
                binding.value(event, el);
            }
        };
        el.addEventListener('scroll', el.scrollEndEvent);
    },
    unmounted(el) {
        el.removeEventListener('scroll', el.scrollEndEvent);
    },
};

export default scrollEnd;
