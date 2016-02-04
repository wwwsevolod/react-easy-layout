import React, {Component, PropTypes, Children, cloneElement} from 'react';

import Block from '../Block';

export default class Cell extends Component {
    static propTypes = {
        height: PropTypes.string.isRequired,
        width: PropTypes.string.isRequired
    };

    static defaultProps = {
        height: '',
        width: ''
    };

    render() {
        return <Block
            {...this.props}
            static={true}
        >
            {this.props.children}
        </Block>;
    }
}
