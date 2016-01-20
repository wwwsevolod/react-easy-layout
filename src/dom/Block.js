import React, {Component, PropTypes} from 'react';
import block from './bem';

import {
    selfAlignPropType
} from '../propTypes';

import {
    AUTO,
    TO_START,
    TO_END,
    CENTER,
    BASELINE,
    STRETCH
} from '../constants';

const bem = block('Block');

export default class Block extends Component {
    static AUTO = AUTO;
    static TO_START = TO_START;
    static TO_END = TO_END;
    static CENTER = CENTER;
    static BASELINE = BASELINE;
    static STRETCH = STRETCH;


    static defaultProps = {
        size: '',
        alignSelf: AUTO,
        grow: true,
        shrink: true,
        width: '',
        height: '',
        isRowWrapper: false,
        static: false
    };

    static propTypes = {
        isRowWrapper: PropTypes.bool.isRequired,
        size: PropTypes.string.isRequired,
        width: PropTypes.string.isRequired,
        height: PropTypes.string.isRequired,
        alignSelf: selfAlignPropType.isRequired,
        grow: PropTypes.bool.isRequired,
        shrink: PropTypes.bool.isRequired,
        static: PropTypes.bool.isRequired
    };

    render() {
        let width = this.props.width;
        if (width && parseInt(width, 10).toString() === width) {
            width = `${width}px`;
        }

        let height = this.props.height;
        if (height && parseInt(height, 10).toString() === height) {
            height = `${height}px`;
        }

        const styles = {};

        if (width) {
            styles.width = width;
        }

        if (height) {
            styles.height = height;
        }

        if (this.props.size) {
            styles.flexBasis = this.props.size;
            styles.WebkitFlexBasis = this.props.size;
            styles.MsFlexPreferredSize = this.props.size;
        }


        return <div style={styles} className={bem({
            isRowWrapper: this.props.isRowWrapper,
            static: this.props.static,
            alignSelf: this.props.alignSelf,
            grow: this.props.grow && !this.props.static,
            noGrow: !this.props.grow || this.props.static,
            shrink: this.props.shrink && !this.props.static,
            noShrink: !this.props.shrink || this.props.static
        })}>
            {this.props.children}
        </div>;
    }
}
