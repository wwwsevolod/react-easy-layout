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

let cancelFrame;
let requestFrame;

if (typeof cancelAnimationFrame !== 'undefined' && typeof requestAnimationFrame !== 'undefined') {
    requestFrame = requestAnimationFrame;
    cancelFrame = cancelAnimationFrame;
} else {
    requestFrame = (cb) => setTimeout(cb, 32);
    cancelFrame = (id) => clearTimeout(id);
}

const PRELOAD = 2;

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
        getPrimaryKeyValue: PropTypes.func.isRequired
    };


    static defaultProps = {
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
        offsetTop: 0,

        scrollTop: 0,
        scrollLeft: 0,
        availHeight: 0,
        viewportStart: 0,

        totalHeightStyle: {height: '0px'},
        additionalHeightFakeTop: 0,
        additionalHeightFakeBottom: 0
    };

    scrollListener = (event) => {
        if (this.frame) {
            cancelFrame(this.frame);
        }
        this.frame = requestFrame(() => this.updateScrollState(this.props));
    };

    getViewStateWithCustomHeights(props, scrollTop, viewportStart, availHeight, virtualScrollTop) {
        // const heights = props.customRowsHeights.slice().sort((item1, item2) => item1.index - item2.index);
        const heights = props.customRowsHeights.reduce((accum, item) => {
            accum[item.index] = item.height;

            return accum;
        }, {});

        let offsetTop = 0;
        let height = 0;
        let fromIndex = -1;
        let toIndex = -1;

        let lastUpliftedIndex = 0;
        let colHeight = 0;

        for (let index = 0; index < props.rowsCount; index++) {
            const currentHeight = (index in heights) ? heights[index] : props.rowHeight;

            if (fromIndex === -1) {
                if ((offsetTop + currentHeight) < virtualScrollTop) {
                    offsetTop += currentHeight;
                } else {
                    colHeight = (offsetTop + currentHeight) - virtualScrollTop;
                    fromIndex = index;

                    if (colHeight >= availHeight) {
                        toIndex = fromIndex + 1;
                    }
                }
            } else if (toIndex === -1) {
                colHeight += currentHeight;

                if (colHeight >= availHeight || index + 1 === props.rowsCount) {
                    toIndex = index + 1;
                }
            }

            height += currentHeight;
        }

        return {
            fromIndex,
            toIndex,
            height,
            offsetTop
        };
    }

    getViewState(props, scrollTop, viewportStart, availHeight) {
        const virtualScrollTop = Math.max(0, scrollTop - viewportStart);

        if (!props.customRowsHeights || !props.customRowsHeights.length) {
            const fromIndex = Math.max(0, Math.floor(virtualScrollTop / props.rowHeight) - PRELOAD);
            const toIndex = Math.min(
                props.rowsCount,
                fromIndex + Math.floor(availHeight / props.rowHeight) + PRELOAD * 2
            );

            return {
                fromIndex,
                toIndex,
                offsetTop: fromIndex * props.rowHeight,
                height: props.rowsCount * props.rowHeight
            };
        }

        return this.getViewStateWithCustomHeights(props, scrollTop, viewportStart, availHeight, virtualScrollTop);
    }

    updateScrollState(props) {
        if (!this.nodeWithScroll) {
            return;
        }
        if (!this.refs.infiniteScrollView) {
            return;
        }

        const infiniteScrollView = findDOMNode(this.refs.infiniteScrollView);
        const newState = {};

        newState.scrollLeft = props.scrollLeftGetter(infiniteScrollView, this.nodeWithScroll);
        const scrollTop = props.scrollTopGetter(infiniteScrollView, this.nodeWithScroll);
        const availHeight = props.maxViewportGetter(infiniteScrollView, this.nodeWithScroll);
        const viewportStart = props.viewportStartGetter(infiniteScrollView, this.nodeWithScroll);


        newState.scrollTop = scrollTop;

        newState.availHeight = availHeight;

        newState.viewportStart = viewportStart;

        const {fromIndex, toIndex, height, offsetTop} = this.getViewState(
            props,
            scrollTop,
            viewportStart,
            availHeight
        );

        if (this.state.totalHeightStyle.height !== `${height}px`) {
            newState.totalHeightStyle = {
                height: `${height}px`
            };
        }

        newState.fromIndex = fromIndex;
        newState.toIndex = toIndex;
        newState.offsetTop = offsetTop;


        if (props.beforeStateChangeCallback) {
            props.beforeStateChangeCallback();
        }

        if (props.stateCallback) {
            this.setState(newState, props.stateCallback);
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
        } else {
            this.updateScrollState(nextProps);
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
        if (this.frame) {
            cancelFrame(this.frame);
        }
    }

    getChildren() {
        const result = {
            headerChildren: null,
            rowChildren: null,
            footerChildren: null
        };

        const {children} = this.props;

        if (!Array.isArray(children) && !children.key) {
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

        let customHeights = {};

        if (this.props.customRowsHeights) {
            customHeights = this.props.customRowsHeights.reduce((accum, item) => {
                accum[item.index] = item.height;
                return accum;
            }, {});
        }

        if (rowChildren) {
            const rows = [];

            for (let index = fromIndex; index < toIndex; index++) {
                const primaryKey = this.props.getPrimaryKeyValue(index);

                const height = index in customHeights ? customHeights[index] : this.props.rowHeight;

                rows.push(this.getRowElement(rowChildren, height, index, primaryKey));
            }

            allRows.push(<div style={this.state.totalHeightStyle} key="__real-rows__" ref="infiniteScrollView">
                {rows.length ? <div
                    className="InfiniteScrollView__Offset"
                    style={{transform: `translateY(${this.state.offsetTop}px)`}}
                >
                    {rows}
                </div> : null}
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
