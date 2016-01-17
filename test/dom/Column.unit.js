import {Column, Box} from 'dom';
import block from 'bem-cn';

describe('Column', () => {
    it(`should render className that contains Column's css class`, () => {
        expect(renderElement(<Column />)).to.include(<Box type={Box.TYPE_COLUMN} />);
    });

    it(`should render className that contains reverse Column's css class`, () => {
        expect(renderElement(<Column reverse={true} />)).to.include(<Box type={Box.TYPE_COLUMN_REVERSE} />);
    });
});
