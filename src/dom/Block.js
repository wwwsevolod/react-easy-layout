import React, {Component, PropTypes} from 'react';

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


export class Block extends Component {
    static AUTO = AUTO;
    static TO_START = TO_START;
    static TO_END = TO_END;
    static CENTER = CENTER;
    static BASELINE = BASELINE;
    static STRETCH = STRETCH;


    static defaultProps = {
        size: 'auto',
        align: AUTO,
        grow: true,
        shrink: true,
        static: false
    };

    static propTypes = {
        size: PropTypes.string.isRequired,
        align: selfAlignPropType.isRequired,
        grow: PropTypes.bool.isRequired,
        shrink: PropTypes.bool.isRequired,
        static: PropTypes.bool.isRequired
    };

    render() {
        const styles = {
            flexBasis: this.props.size,
            WebkitFlexBasis: this.props.size,
            MsFlexPreferredSize: this.props.size
        };

        return <div style={styles} className={this.bem({
            static: this.props.static,
            grow: this.props.grow && !this.props.static,
            noGrow: !this.props.grow || this.props.static,
            shrink: this.props.shrink && !this.props.static,
            noShrink: !this.props.shrink || this.props.static
        })}>
            {this.props.children}
        </div>;
    }
}
