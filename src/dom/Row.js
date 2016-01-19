import React, {Component, PropTypes} from 'react';
import Box from './Box';

import {
    alignPropType,
    contentPropType,
    justifyPropType
} from '../propTypes';

export default class Row extends Component {
    render() {
        return <Box
            type={this.props.reverse ? Box.TYPE_ROW_REVERSE : Box.TYPE_ROW}
            wrap={this.props.wrap}
            align={this.props.align}
            justify={this.props.justify}
            content={this.props.content}
            fix={this.props.fix}
            height={this.props.height}
            width={this.props.width}
        >
            {this.props.children}
        </Box>;
    }

    static SPACE_BETWEEN = Box.SPACE_BETWEEN;
    static SPACE_AROUND = Box.SPACE_AROUND;
    static CENTER = Box.CENTER;
    static TO_START = Box.TO_START;
    static TO_END = Box.TO_END;
    static BASELINE = Box.BASELINE;
    static STRETCH = Box.STRETCH;

    static NOWRAP = Box.NOWRAP;
    static WRAP = Box.WRAP;
    static WRAP_REVERSE = Box.WRAP_REVERSE;

    static propTypes = {
        align: alignPropType,
        content: contentPropType,
        justify: justifyPropType,
        reverse: PropTypes.bool.isRequired,
        width: PropTypes.string.isRequired,
        height: PropTypes.string.isRequired,
        fix: PropTypes.bool.isRequired,
        wrap: PropTypes.string.isRequired
    };

    static defaultProps = {
        reverse: false,
        wrap: Box.NOWRAP,
        content: Box.TO_START,
        align: Box.TO_START,
        justify: Box.TO_START,
        width: '100%',
        height: 'auto',
        fix: true
    };
}
