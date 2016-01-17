import {Row, Box} from 'dom';
import block from 'bem-cn';

describe('Row', () => {
    it(`should render className that contains Row's css class`, () => {
        const renderer = TestUtils.createRenderer();
        renderer.render(<Row />);

        const element = renderer.getRenderOutput();

        expect(element).to.include(<Box type={Box.TYPE_ROW} />);
    });

    it(`should render className that contains reverse Row's css class`, () => {
        const renderer = TestUtils.createRenderer();
        renderer.render(<Row reverse={true} />);

        const element = renderer.getRenderOutput();

        expect(element).to.include(<Box type={Box.TYPE_ROW_REVERSE} />);
    });
});
