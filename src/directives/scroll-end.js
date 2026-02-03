const scrollEnd = {
    mounted(el, binding) {
        el.addEventListener('scroll', (event) => {
            const isAtEnd = ((el.scrollTop + el.clientHeight) * 1.05) >= el.scrollHeight;
            if (isAtEnd) {
                binding.value(event, el);
            }
        });
    },
};

export default scrollEnd;
