import b from 'b_';

const protoBem = b.B({
    tailSpace: '',
    elementSeparator: '__',
    modSeparator: '_',
    modValueSeparator: '_',
    classSeparator: ' '
});

export default (blockName) => {
    blockName = `easy-layout-${blockName}`;
    const bem = (...args) => protoBem(blockName, ...args);
    bem.toString = () => bem();
    return bem;
};
