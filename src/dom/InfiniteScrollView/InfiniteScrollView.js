import React, {Component, PropTypes, Children, cloneElement} from 'react';
import {findDOMNode} from 'react-dom';
import bem from '../bem';
import Column from '../Column';


function defaultParentWithScrollGetter(viewNode) {
    return document;
}

function defaultScrollTopGetter(viewNode, node) {
    if (node === document.body || node === document.documentElement || node === document) {
        return document.body.scrollTop || document.documentElement.scrollTop;
    }

    return node.scrollTop;
}

function defaultScrollLeftGetter(viewNode, node) {
    if (node === document.body || node === document.documentElement || node === document) {
        return document.body.scrollLeft || document.documentElement.scrollLeft;
    }

    return node.scrollLeft;
}


function defaultViewportStartGetter(viewNode, nodeWithScroll) {
    return viewNode.offsetTop;
}

function defaultMaxViewportGetter(viewNode, nodeWithScroll) {
    return window.screen.availHeight;
}

function defaultGetCurrentFirstRowIndex({
    scrollTop,
    availHeight,
    viewportStart,
    rowHeight,
    rowsCount
}) {
    const start = Math.floor(Math.max(0, scrollTop - viewportStart) / rowHeight);
    const preload = 2;// (availHeight / rowHeight);

    return Math.max(0, Math.floor(start - preload));
}

function defaultGetCurrentLastRowIndex({
    scrollTop,
    availHeight,
    viewportStart,
    rowHeight,
    rowsCount
}) {
    const end = Math.floor(Math.max(0, (scrollTop - viewportStart) + availHeight) / rowHeight);
    const preload = 2;// (availHeight / rowHeight);

    return Math.min(rowsCount, Math.floor(end + preload));
}

const block = bem('InfiniteScrollView');

export default class InfiniteScrollView extends Component {
    static propTypes = {
        rowHeight: PropTypes.number.isRequired,
        rowsCount: PropTypes.number.isRequired,

        customRowsHeights: PropTypes.arrayOf(PropTypes.shape({
            index: PropTypes.number,
            height: PropTypes.number
        })),

        stateCallback: PropTypes.func,
        beforeStateChangeCallback: PropTypes.func,

        parentWithScrollGetter: PropTypes.func.isRequired,
        scrollTopGetter: PropTypes.func.isRequired,
        viewportStartGetter: PropTypes.func.isRequired,
        maxViewportGetter: PropTypes.func.isRequired,
        getCurrentFirstRowIndex: PropTypes.func.isRequired,
        getCurrentLastRowIndex: PropTypes.func.isRequired,
        getPrimaryKeyValue: PropTypes.func.isRequired
    };


    static defaultProps = {
        getCurrentFirstRowIndex: defaultGetCurrentFirstRowIndex,
        getCurrentLastRowIndex: defaultGetCurrentLastRowIndex,
        parentWithScrollGetter: defaultParentWithScrollGetter,
        scrollTopGetter: defaultScrollTopGetter,
        scrollLeftGetter: defaultScrollLeftGetter,
        viewportStartGetter: defaultViewportStartGetter,
        maxViewportGetter: defaultMaxViewportGetter,

        getPrimaryKeyValue(index) {
            return index;
        }
    };

    state = {
        toIndex: 0,
        fromIndex: 0,

        scrollTop: 0,
        scrollLeft: 0,
        availHeight: 0,
        viewportStart: 0,

        totalHeightStyle: {height: '0px'},
        additionalHeightFakeTop: 0,
        additionalHeightFakeBottom: 0
    };

    scrollListener = (event) => {
        this.updateScrollState(this.props);
    };

    updateScrollState(props) {
        if (!this.nodeWithScroll) {
            return;
        }
        if (!this.refs.infiniteScrollView) {
            return;
        }

        const infiniteScrollView = findDOMNode(this.refs.infiniteScrollView);

        const scrollTop = props.scrollTopGetter(infiniteScrollView, this.nodeWithScroll);
        const scrollLeft = props.scrollLeftGetter(infiniteScrollView, this.nodeWithScroll);
        const availHeight = props.maxViewportGetter(infiniteScrollView, this.nodeWithScroll);
        const viewportStart = props.viewportStartGetter(infiniteScrollView, this.nodeWithScroll);

        const newState = {};

        newState.scrollTop = scrollTop;

        newState.availHeight = availHeight;

        newState.viewportStart = viewportStart;

        let fromIndex = this.props.getCurrentFirstRowIndex({
            scrollTop: scrollTop,
            availHeight: availHeight,
            viewportStart: viewportStart,
            rowsCount: this.props.rowsCount,
            rowHeight: this.props.rowHeight
        });

        let toIndex = this.props.getCurrentLastRowIndex({
            scrollTop: scrollTop,
            availHeight: availHeight,
            viewportStart: viewportStart,
            rowsCount: this.props.rowsCount,
            rowHeight: this.props.rowHeight
        });

        let totalHeight = this.props.rowsCount * this.props.rowHeight;

        if (this.props.customRowsHeights) {
            let uplifted = 0;
            let upliftedHeightSum = 0;

            let lifted = 0;
            let liftedHeightSum = 0;

            let downlifted = 0;
            let downliftedHeightSum = 0;

            this.props.customRowsHeights.forEach((item) => {
                totalHeight = (totalHeight + item.height) - this.props.rowHeight;

                if (item.index < fromIndex) {
                    uplifted++;
                    upliftedHeightSum += item.height;
                } else if (item.index >= fromIndex && item.index <= toIndex) {
                    lifted++;
                    liftedHeightSum += item.height;
                } else if (item.index > toIndex) {
                    downlifted++;
                    downliftedHeightSum += item.height;
                }
            });

            if (uplifted > 0) {
                const diffHeight = upliftedHeightSum - uplifted * this.props.rowHeight;

                newState.additionalHeightFakeTop = diffHeight;
            } else {
                newState.additionalHeightFakeTop = 0;
            }

            if (lifted > 0) {

            }

            if (downlifted > 0) {
                const diffHeight = downliftedHeightSum - downlifted * this.props.rowHeight;

                newState.additionalHeightFakeBottom = diffHeight;
            } else {
                newState.additionalHeightFakeBottom = 0;
            }
        } else {
            newState.additionalHeightFakeTop = 0;
            newState.additionalHeightFakeBottom = 0;
        }

        if (this.state.totalHeightStyle.height !== `${totalHeight}px`) {
            newState.totalHeightStyle = {
                height: `${totalHeight}px`
            };
        }

        newState.fromIndex = fromIndex;
        newState.toIndex = toIndex;

        newState.scrollLeft = scrollLeft;

        if (this.props.beforeStateChangeCallback) {
            this.props.beforeStateChangeCallback();
        }

        if (this.props.stateCallback) {
            this.setState(newState, this.props.stateCallback);
        } else {
            this.setState(newState);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!this.refs.infiniteScrollView) {
            return;
        }
        const infiniteScrollView = findDOMNode(this.refs.infiniteScrollView);
        if (nextProps.parentWithScrollGetter(infiniteScrollView) !== this.nodeWithScroll) {
            this.clearScrollListener();
            this.setUpScrollListener(nextProps);
        }
    }

    setUpScrollListener(props) {
        if (!this.refs.infiniteScrollView) {
            return;
        }
        this.nodeWithScroll = props.parentWithScrollGetter(findDOMNode(this.refs.infiniteScrollView));

        if (!this.nodeWithScroll) {
            return;
        }

        this.nodeWithScroll.addEventListener('scroll', this.scrollListener, false);
        this.updateScrollState(props);
    }

    clearScrollListener() {
        if (this.nodeWithScroll) {
            this.nodeWithScroll.removeEventListener('scroll', this.scrollListener, false);
        }
    }

    componentDidMount() {
        this.setUpScrollListener(this.props);
    }

    componentWillUnmount() {
        this.clearScrollListener();
    }

    getChildren() {
        const result = {
            headerChildren: null,
            rowChildren: null,
            footerChildren: null
        };

        const {children} = this.props;

        if (!Array.isArray(children) && !children.props.key) {
            result.rowChildren = children;
        } else {
            Children.forEach(children, (child) => {
                if ((!child.key || child.key === 'row') && !result.rowChildren) {
                    result.rowChildren = child;
                } else if (child.key === 'header') {
                    result.headerChildren = child;
                } else if (child.key === 'footer') {
                    result.footerChildren = child;
                } else {
                    if (process.env.NODE_ENV === 'development') {
                        console.error('Two or more row childern (with key="row" or without key at all).'); 
                    }
                }
            });
        }

        return result;
    }

    asd = {};

    getRowElement(rowChildren, height, index, primaryKey) {
        return cloneElement(rowChildren, Object.assign(
            {},
            rowChildren.props,
            {
                availHeight: this.state.availHeight,
                viewportStart: this.state.viewportStart,
                rowsCount: this.props.rowsCount,
                height,
                index,
                primaryKey,
                key: primaryKey,
                defaultHeight: this.props.rowHeight
            }
        ));
    }

    renderRows() {
        const {fromIndex, toIndex, additionalHeightFakeTop} = this.state;

        const allRows = [];
        const rows = [];

        const {headerChildren, rowChildren, footerChildren} = this.getChildren();

        if (headerChildren) {
            allRows.push(cloneElement(headerChildren, Object.assign(
                {},
                headerChildren.props,
                {
                    scrollTop: this.state.scrollTop,
                    scrollLeft: this.state.scrollLeft,
                    availHeight: this.state.availHeight,
                    viewportStart: this.state.viewportStart,
                    rowsCount: this.props.rowsCount,
                    height: this.props.rowHeight,
                    defaultHeight: this.props.rowHeight,
                    fromIndex,
                    toIndex
                }
            )));
        }

        const fakeTopCellHeightSize = fromIndex * this.props.rowHeight + additionalHeightFakeTop;

        let customHeights = {};

        if (this.props.customRowsHeights) {
            customHeights = this.props.customRowsHeights.reduce((accum, item) => {
                accum[item.index] = item.height;
                return accum;
            }, {});
        }

        if (rowChildren) {
            for (let index = fromIndex; index < toIndex; index++) {
                const primaryKey = this.props.getPrimaryKeyValue(index);

                const height = index in customHeights ? customHeights[index] : this.props.rowHeight;

                rows.push(this.getRowElement(rowChildren, height, index, primaryKey));
            }

            allRows.push(<div style={this.state.totalHeightStyle} key="__real-rows__" ref="infiniteScrollView">
                <div style={{transform: `translateY(${fakeTopCellHeightSize}px)`}}>
                    {rows}
                </div>
            </div>);
        }



        if (footerChildren) {
            allRows.push(cloneElement(footerChildren, Object.assign(
                {},
                footerChildren.props,
                {
                    scrollTop: this.state.scrollTop,
                    scrollLeft: this.state.scrollLeft,
                    availHeight: this.state.availHeight,
                    viewportStart: this.state.viewportStart,
                    rowsCount: this.props.rowsCount,
                    height: this.props.rowHeight,
                    fromIndex,
                    toIndex,
                    defaultHeight: this.props.rowHeight
                }
            )));
        }

        return allRows;
    }

    render() {
        return <div>
            {this.renderRows()}
        </div>;
    }
}
