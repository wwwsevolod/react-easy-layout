import React, {Component, PropTypes, Children, cloneElement} from 'react';
import {findDOMNode} from 'react-dom';
import bem from '../bem';
import Column from '../Column';
import {getTiles, getHeightFromTiles, selectRowsAndOffsetFromVisibleTiles} from './Tiles';

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

const defaultArray = [];

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

    needToUpdateTiles(customRowsHeights, rowsCount, rowHeight, availHeight) {
        if (this.prevCustomRowsHeights !== customRowsHeights) {
            return true;
        }

        if (this.prevRowsCount !== rowsCount) {
            return true;
        }

        if (this.prevRowHeight !== rowHeight) {
            return true;
        }

        if (this.prevAvailHeight !== availHeight) {
            return true;
        }

        return false;
    }

    getTilesAndHeight(customRowsHeights, rowsCount, rowHeight, availHeight) {
        if (!this.tiles || this.needToUpdateTiles(customRowsHeights, rowsCount, rowHeight, availHeight)) {
            this.prevCustomRowsHeights = customRowsHeights;
            this.prevRowsCount = rowsCount;
            this.prevRowHeight = rowHeight;
            this.prevAvailHeight = availHeight;

            const tileHeight = Math.floor(availHeight / 2 / rowHeight + 1) * rowHeight;

            this.tiles = getTiles(
                customRowsHeights || [],
                rowsCount,
                rowHeight,
                tileHeight
            );

            this.fullHeight = getHeightFromTiles(this.tiles, tileHeight);
        }

        return {
            tiles: this.tiles,
            height: this.fullHeight
        };
    }

    getViewState(props, scrollTop, viewportStart, availHeight) {
        const virtualScrollTop = Math.max(0, scrollTop - viewportStart);

        const {tiles, height} = this.getTilesAndHeight(
            props.customRowsHeights || defaultArray,
            props.rowsCount,
            props.rowHeight,
            availHeight
        );

        const {indexFrom, indexTo, offsetTop} = selectRowsAndOffsetFromVisibleTiles(
            tiles,
            props.rowsCount,
            virtualScrollTop,
            Math.floor(availHeight / 2 / props.rowHeight + 1) * props.rowHeight,
            availHeight
        );

        if (indexTo - indexFrom > 1000) {
            throw new Error('WTF');
        }

        return {
            fromIndex: indexFrom,
            toIndex: indexTo,
            height,
            offsetTop
        };
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
