import {Block} from 'dom';

describe('Block', () => {
    it('should render static if static provided', () => {
        const element = renderElement(<Block static={true} />);

        expect(element).to.have.className('easy-layout-Block_static');
    });

    it('should render static if static AND grow or shrink provided anyway', () => {
        const element = renderElement(<Block
            static={true}
            grow={true}
            shrink={true}
        />);

        expect(element).to.have.className('easy-layout-Block_static');

        expect(element).to.have.className('easy-layout-Block_noGrow');
        expect(element).to.have.className('easy-layout-Block_noShrink');
        expect(element).not.to.have.className('easy-layout-Block_grow');
        expect(element).not.to.have.className('easy-layout-Block_shrink');
    });

    it('should grow and shrink if not static', () => {
        const element = renderElement(<Block
            static={false}
            grow={true}
            shrink={true}
        />);

        expect(element).not.to.have.className('easy-layout-Block_static');
        expect(element).not.to.have.className('easy-layout-Block_noGrow');
        expect(element).not.to.have.className('easy-layout-Block_noShrink');
        expect(element).to.have.className('easy-layout-Block_grow');
        expect(element).to.have.className('easy-layout-Block_shrink');
    });

    it('should set width and height in pixels', () => {
        const element = renderElement(<Block width={100} height={2000}></Block>);
        expect(element).to.have.prop('style').deep.equal({
            height: '2000px',
            width: '100px'
        });
    });

    it('should not set basis when no size is provided', () => {
        const element = renderElement(<Block></Block>);
        expect(element).to.have.prop('style').not.to.have.property('flexBasis');
    });

    it('should set basis when size is provided', () => {
        const element = renderElement(<Block size="auto"></Block>);
        expect(element).to.have.prop('style').to.have.property('flexBasis').equals('auto');
    });

    it('should not set width when no width is provided', () => {
        const element = renderElement(<Block></Block>);
        expect(element).to.have.prop('style').not.to.have.property('width');
    });

    it('should set width when width is provided', () => {
        const element = renderElement(<Block width="100%"></Block>);
        expect(element).to.have.prop('style').to.have.property('width').equals('100%');
    });

    it('should set width and height in unit that was set', () => {
        const element = renderElement(<Block width="100vh" height="2000%"></Block>);
        expect(element).to.have.prop('style').deep.equal({
            height: '2000%',
            width: '100vh'
        });
    });
});
