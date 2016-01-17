import React, {Component, PropTypes} from 'react';
import block from './bem';

import {
    SPACE_BETWEEN,
    SPACE_AROUND,
    CENTER,
    TO_START,
    TO_END,
    BASELINE,
    STRETCH,
    TYPE_COLUMN,
    TYPE_COLUMN_REVERSE,
    TYPE_ROW,
    TYPE_ROW_REVERSE,
    WRAP_NOWRAP,
    WRAP_WRAP,
    WRAP_REVERSE
} from '../constants';

import {
    alignPropType,
    contentPropType,
    justifyPropType
} from '../propTypes';

const bem = block('Box');


export default class Box extends Component {
    render() {
        return <div className={bem({
            wrap: this.props.wrap,
            align: this.props.align,
            justify: this.props.justify,
            content: this.props.content,
            fix: this.props.fix,
            type: this.props.type
        })} style={{
            height: this.props.height,
            width: this.props.width
        }}>
            {this.props.children}
        </div>;
    }

    static SPACE_BETWEEN = SPACE_BETWEEN;
    static SPACE_AROUND = SPACE_AROUND;
    static CENTER = CENTER;
    static TO_START = TO_START;
    static TO_END = TO_END;
    static BASELINE = BASELINE;
    static STRETCH = STRETCH;

    static TYPE_COLUMN = TYPE_COLUMN;
    static TYPE_ROW = TYPE_ROW;

    static NOWRAP = WRAP_NOWRAP;
    static WRAP = WRAP_WRAP;
    static WRAP_REVERSE = WRAP_REVERSE;

    static propTypes = {
        align: alignPropType.isRequired,
        content: contentPropType.isRequired,
        justify: justifyPropType.isRequired,

        width: PropTypes.string.isRequired,
        height: PropTypes.string.isRequired,
        fix: PropTypes.bool.isRequired,
        type: PropTypes.string.isRequired,
        wrap: PropTypes.string.isRequired
    };

    static defaultProps = {
        type: TYPE_ROW,
        wrap: WRAP_NOWRAP,
        content: TO_START,
        align: TO_START,
        justify: TO_START,
        width: '100%',
        height: 'auto',
        fix: true
    };
}
