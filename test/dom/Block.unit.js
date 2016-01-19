import {Block} from 'dom';

describe('Block', () => {
    it('should render static if static provided', () => {
        const element = renderElement(<Block static={true} />);

        expect(
            element.props.className.toString()
        ).to.match(/(^|\s)easy-layout-Block_static($|\s)/);
    });

    it('should render static if static AND grow or shrink provided anyway', () => {
        const element = renderElement(<Block
            static={true}
            grow={true}
            shrink={true}
        />);

        expect(
            element.props.className.toString()
        ).to.match(/(^|\s)easy-layout-Block_static($|\s)/);
        expect(
            element.props.className.toString()
        ).to.match(/(^|\s)easy-layout-Block_noGrow($|\s)/);
        expect(
            element.props.className.toString()
        ).to.match(/(^|\s)easy-layout-Block_noShrink($|\s)/);
        expect(
            element.props.className.toString()
        ).not.to.match(/(^|\s)easy-layout-Block_grow($|\s)/);
        expect(
            element.props.className.toString()
        ).not.to.match(/(^|\s)easy-layout-Block_shrink($|\s)/);
    });

    it('should grow and shrink if not static', () => {
        const element = renderElement(<Block
            static={false}
            grow={true}
            shrink={true}
        />);

        expect(
            element.props.className.toString()
        ).not.to.match(/(^|\s)easy-layout-Block_static($|\s)/);
        expect(
            element.props.className.toString()
        ).not.to.match(/(^|\s)easy-layout-Block_noGrow($|\s)/);
        expect(
            element.props.className.toString()
        ).not.to.match(/(^|\s)easy-layout-Block_noShrink($|\s)/);
        expect(
            element.props.className.toString()
        ).to.match(/(^|\s)easy-layout-Block_grow($|\s)/);
        expect(
            element.props.className.toString()
        ).to.match(/(^|\s)easy-layout-Block_shrink($|\s)/);
    });

    it('should set width and height in pixels', () => {
        const element = renderElement(<Block width="100" height="2000"></Block>);
        expect(element.props.style.width).to.equal('100px');
        expect(element.props.style.height).to.equal('2000px');
    });

    it('should set width and height in unit that was set', () => {
        const element = renderElement(<Block width="100vh" height="2000%"></Block>);
        expect(element.props.style.width).to.equal('100vh');
        expect(element.props.style.height).to.equal('2000%');
    });
});
