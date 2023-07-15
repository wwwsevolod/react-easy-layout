import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Box from './Box';
import Block from './Block';

import {
    alignPropType,
    contentPropType,
    selfAlignPropType,
    justifyPropType
} from '../propTypes';

import {
    AUTO
} from '../constants';

export default class Row extends Component {
    static SPACE_BETWEEN = Box.SPACE_BETWEEN;
    static SPACE_AROUND = Box.SPACE_AROUND;
    static CENTER = Box.CENTER;
    static AUTO = AUTO;
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
        height: PropTypes.oneOfType([
            PropTypes.string.isRequired,
            PropTypes.number.isRequired
        ]),
        fix: PropTypes.bool.isRequired,
        wrap: PropTypes.string.isRequired,

        style: PropTypes.any, // eslint-disable-line react/forbid-prop-types

        // Wrapper Block props
        size: PropTypes.string.isRequired,
        alignSelf: selfAlignPropType.isRequired,
        grow: PropTypes.bool.isRequired,
        shrink: PropTypes.bool.isRequired,
        static: PropTypes.bool.isRequired
    };

    static defaultProps = {
        reverse: false,
        wrap: Box.NOWRAP,
        content: Box.TO_START,
        align: Box.TO_START,
        justify: Box.TO_START,
        width: '100%',
        height: 'auto',
        fix: true,

        size: '',
        alignSelf: AUTO,
        grow: true,
        shrink: true,
        static: false
    };

    render() {
        return <Block
            width={this.props.width}
            height={this.props.height}
            size={this.props.size}
            alignSelf={this.props.alignSelf}
            className={this.props.className}
            grow={this.props.grow}
            shrink={this.props.shrink}
            static={this.props.static}
            isRowWrapper={this.props.fix}
            style={this.props.style}
        >
            <Box
                type={this.props.reverse ? Box.TYPE_ROW_REVERSE : Box.TYPE_ROW}
                wrap={this.props.wrap}
                align={this.props.align}
                justify={this.props.justify}
                content={this.props.content}
                fix={this.props.fix}
                width={this.props.width}
                height={this.props.height}
            >
                {this.props.children}
            </Box>
        </Block>;
    }
}
