import {InfiniteScrollView} from 'dom-infinite-scroll-view';
import {Column, Block, Row} from 'dom';

function TestRow({
    index,
    height
}) {
    return <Row
        index={index}
        height={height}
        className="TestRow"
    >
        <Block static={true} width="100px">
            id: {index}
        </Block>
        <Block static={true} width="200px">
            count: {Math.floor(index * 1000)}
        </Block>
    </Row>;
}

function TestHeader() {
    return <Row>
        <Block>
            Header
        </Block>
    </Row>;
}

function TestFooter() {
    return <Row>
        <Block>
            Footer
        </Block>
    </Row>;
}

describe('InfiniteScrollView', () => {
    it('should render Header and Footer and Rows when there is elements with this keys', () => {
        let element = mount(<InfiniteScrollView
            rowHeight={30}
            rowsCount={100}
        >
            <TestHeader key="header" />
            <TestFooter key="footer" />
        </InfiniteScrollView>);


        expect(element).to.contain(<Row>
            <Block>
                Header
            </Block>
        </Row>);

        expect(element).to.contain(<Row>
            <Block>
                Footer
            </Block>
        </Row>);

        expect(element).to.not.have.ref('infiniteScrollView');

        element = mount(<InfiniteScrollView
            rowHeight={30}
            rowsCount={100}
        >
            <TestHeader key="header" />
            <TestRow />
        </InfiniteScrollView>);


        expect(element).to.contain(<Row>
            <Block>
                Header
            </Block>
        </Row>);

        expect(element).not.to.contain(<Row>
            <Block>
                Footer
            </Block>
        </Row>);

        expect(element).to.have.ref('infiniteScrollView');
    });

    it('should render full screen of rows when outside of viewport', () => {
        const element = mount(<InfiniteScrollView
            rowHeight={30}
            rowsCount={100}
            maxViewportGetter={() => 300}
            viewportStartGetter={() => 500}
            scrollTopGetter={() => 0}
        >
            <TestHeader key="header" />
            <TestRow />
        </InfiniteScrollView>);

        expect(element.ref('infiniteScrollView')).that.have.style('height').equals('3000px');

        expect(element).to.have.exactly(14).descendants('.TestRow');
        expect(element).to.contain(
            TestRow({
                index: 0,
                height: 30
            })
        );

        expect(element).to.contain(
            TestRow({
                index: 13,
                height: 30
            })
        );

        expect(element).not.to.contain(
            TestRow({
                index: 14,
                height: 30
            })
        );
    });

    it('should render full screen of rows when just started to be in viewport', () => {
        const element = mount(<InfiniteScrollView
            rowHeight={30}
            rowsCount={100}
            maxViewportGetter={() => 300}
            viewportStartGetter={() => 200}
            scrollTopGetter={() => 0}
        >
            <TestHeader key="header" />
            <TestRow />
        </InfiniteScrollView>);

        expect(element).to.have.exactly(14).descendants('.TestRow');
        expect(element).to.contain(
            TestRow({
                index: 0,
                height: 30
            })
        );

        expect(element).to.contain(
            TestRow({
                index: 13,
                height: 30
            })
        );

        expect(element).not.to.contain(
            TestRow({
                index: 14,
                height: 30
            })
        );
    });

    it('should render full screen of rows, with preload -2\\+2', () => {
        const element = mount(<InfiniteScrollView
            rowHeight={30}
            rowsCount={100}
            maxViewportGetter={() => 300}
            viewportStartGetter={() => 200}
            scrollTopGetter={() => 300}
        >
            <TestHeader key="header" />
            <TestRow />
        </InfiniteScrollView>);

        expect(element).to.have.exactly(14).descendants('.TestRow');

        // 300 / 30 = 10, 10 + preload + preload = 14, preload to top is -2,
        // and (viewport) - (components position) = floor(100 / 30) === 3 (first three element)
        // so we render from 3 to 12 and preload -2 to top and +2 to bottom
        // and we have rows from 1 to 14
        expect(element).not.to.contain(
            TestRow({
                index: 0,
                height: 30
            })
        );
        expect(element).to.contain(
            TestRow({
                index: 1,
                height: 30
            })
        );

        expect(element).to.contain(
            TestRow({
                index: 14,
                height: 30
            })
        );

        expect(element.find('.InfiniteScrollView__Offset')).to.have.style('transform').equals(`translateY(30px)`);
    });

    it('should not render rows when scrolled out from viewport', () => {
        const element = mount(<InfiniteScrollView
            rowHeight={30}
            rowsCount={100}
            maxViewportGetter={() => 300}
            viewportStartGetter={() => 200}
            scrollTopGetter={() => 4000}
        >
            <TestHeader key="header" />
            <TestRow />
        </InfiniteScrollView>);

        expect(element).not.to.have.descendants('.TestRow');
        expect(element).not.to.have.descendants('.InfiniteScrollView__Offset');
    });

    it('should render last rows when footer is in viewport', () => {
        const element = mount(<InfiniteScrollView
            rowHeight={30}
            rowsCount={100}
            maxViewportGetter={() => 300}
            viewportStartGetter={() => 200}
            scrollTopGetter={() => 3000}
        >
            <TestHeader key="header" />
            <TestRow />
            <TestFooter key="footer" />
        </InfiniteScrollView>);

        expect(element).to.have.exactly(9).descendants('.TestRow');

        expect(element).not.to.contain(
            TestRow({
                index: 90,
                height: 30
            })
        );
        expect(element).to.contain(
            TestRow({
                index: 91,
                height: 30
            })
        );
        expect(element).to.contain(
            TestRow({
                index: 99,
                height: 30
            })
        );

        expect(element.find('.InfiniteScrollView__Offset')).to.have.style('transform').equals(`translateY(2730px)`);
    });


    it('should calc right height with custom rows heights', () => {
        const element = mount(<InfiniteScrollView
            rowHeight={30}
            rowsCount={100}
            maxViewportGetter={() => 300}
            viewportStartGetter={() => 0}
            scrollTopGetter={() => 0}
            customRowsHeights={[
                {
                    index: 10,
                    height: 100
                },
                {
                    index: 1,
                    height: 50
                },
                {
                    index: 95,
                    height: 150
                }
            ]}
        >
            <TestHeader key="header" />
            <TestRow />
            <TestFooter key="footer" />
        </InfiniteScrollView>);

        expect(element.ref('infiniteScrollView')).that.have.style('height').equals('3210px');

        element.setProps({
            customRowsHeights: [
                {
                    index: 10,
                    height: 100
                },
                {
                    index: 1,
                    height: 50
                },
                {
                    index: 2,
                    height: 90
                },
                {
                    index: 95,
                    height: 150
                }
            ]
        });

        expect(element.ref('infiniteScrollView')).that.have.style('height').equals('3270px');
    });

    it('should calc right offset and current slice with custom rows heights', () => {
        const element = mount(<InfiniteScrollView
            rowHeight={30}
            rowsCount={100}
            maxViewportGetter={() => 300}
            viewportStartGetter={() => 0}
            scrollTopGetter={() => 30}
            customRowsHeights={[
                    {
                        index: 10,
                        height: 100
                    },
                    {
                        index: 1,
                        height: 50
                    },
                    {
                        index: 95,
                        height: 150
                    }
                ]}
        >
            <TestRow />
        </InfiniteScrollView>);

        expect(element.find('.InfiniteScrollView__Offset')).to.have.style('transform').equals(`translateY(30px)`);

        expect(element).not.to.contain(
            TestRow({
                index: 0,
                height: 30
            })
        );

        expect(element).to.contain(
            TestRow({
                index: 1,
                height: 50
            })
        );

        element.setProps({
            scrollTopGetter: () => 25
        });

        expect(element.find('.InfiniteScrollView__Offset')).to.have.style('transform').equals(`translateY(0px)`);

        element.setProps({
            scrollTopGetter: () => 80
        });

        expect(element.find('.InfiniteScrollView__Offset')).to.have.style('transform').equals(`translateY(30px)`);

        element.setProps({
            scrollTopGetter: () => 110
        });

        expect(element.find('.InfiniteScrollView__Offset')).to.have.style('transform').equals(`translateY(110px)`);

        element.setProps({
            scrollTopGetter: () => 75
        });

        expect(element.find('.InfiniteScrollView__Offset')).to.have.style('transform').equals(`translateY(30px)`);
    });
    
});