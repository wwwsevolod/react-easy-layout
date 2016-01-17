import {Column, Box} from 'dom';
import block from 'bem-cn';

describe('Column', () => {
    it(`should render className that contains Column's css class`, () => {
        const renderer = TestUtils.createRenderer();
        renderer.render(<Column />);

        const element = renderer.getRenderOutput();

        expect(element).to.include(<Box type={Box.TYPE_COLUMN} />);
    });

    it(`should render className that contains reverse Column's css class`, () => {
        const renderer = TestUtils.createRenderer();
        renderer.render(<Column reverse={true} />);

        const element = renderer.getRenderOutput();

        expect(element).to.include(<Box type={Box.TYPE_COLUMN_REVERSE} />);
    });
});
