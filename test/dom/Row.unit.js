import {Row, Box} from 'dom';

describe('Row', () => {
    it(`should render className that contains Row's css class`, () => {
        expect(renderElement(<Row />)).to.include(<Box type={Box.TYPE_ROW} />);
    });

    it(`should render className that contains reverse Row's css class`, () => {
        expect(renderElement(<Row reverse={true} />)).to.include(<Box type={Box.TYPE_ROW_REVERSE} />);
    });
});
