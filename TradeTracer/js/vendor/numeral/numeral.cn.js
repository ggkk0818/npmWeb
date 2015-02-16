numeral.language('cn', {
    delimiters: {
        thousands: ',',
        decimal: '.'
    },
    abbreviations: {
        thousand: '千',
        million: '百万',
        billion: '十亿',
        trillion: '兆'
    },
    ordinal: function (number) {
        return number === 1 ? '名' : '名';
    },
    currency: {
        symbol: '￥'
    }
});
numeral.language('cn');