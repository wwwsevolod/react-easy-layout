import React from 'react';
import {render} from 'react-dom';
import {Column, Block, Row} from '../src';
import {InfiniteScrollView} from '../src/dom-infinite-scroll-view';
import {Table} from '../src/dom-table';
import 'normalize.css';
import '../src/dom/easy-layout.css';
import './index.css';

function MyRow({
    index,
    height
}) {
    return <Row
        key={'row' + index}
        height={height}
    >
        <Block static={true} width="100px">
            id: {index}
        </Block>
        <Block static={true} width="200px">
            count: {Math.floor(index * 1000)}
        </Block>
        <Block static={true} width="100px">
            asd: {index + 100500}
        </Block>
        <Block>
            isOdd: {index % 2 !== 0 ? 'true' : 'false'}
        </Block>
        <Block static={true} width="100px">
            id: {index}
        </Block>
        <Block static={true} width="200px">
            count: {Math.floor(index * 1000)}
        </Block>
        <Block static={true} width="100px">
            asd: {index + 100500}
        </Block>
        <Block>
            isOdd: {index % 2 !== 0 ? 'true' : 'false'}
        </Block>
    </Row>;
}

function Header() {
    return <Row>
        <Block>
            Header
        </Block>
    </Row>;
}

function Footer() {
    return <Row>
        <Block>
            Footer
        </Block>
    </Row>;
}

function TableHeader({height}) {
    return <Table.Row index={-1} height={height}>
        <Table.Cell field="field1">
            Head1
        </Table.Cell>
        <Table.Cell field="field2">
            Head2
        </Table.Cell>
        <Table.Cell field="field3">
            Head3
        </Table.Cell>
        <Table.Cell field="field4">
            Head4
        </Table.Cell>
    </Table.Row>;
}

function TableFooter({height}) {
    return <Table.Row index={-2} height={height}>
        <Table.Cell field="field2">
            Foot2
        </Table.Cell>
        <Table.Cell field="field3">
            Foot3
        </Table.Cell>
    </Table.Row>;
}

function TableMyRow({
    index,
    height
}) {
    return <Table.Row
        key={'row' + index}
        height={height}
        index={index}
    >
        <Table.Cell field="field1">
            id: {index}
        </Table.Cell>
        <Table.Cell field="field2">
            count: {Math.floor(index * 1000)}
        </Table.Cell>
        <Table.Cell field="field3">
            asd: {index + 100500}
        </Table.Cell>
        <Table.Cell field="field4">
            isOdd: {index % 2 !== 0 ? 'true' : 'false'}
        </Table.Cell>
    </Table.Row>;
}

render(
    <div className="App">
        <div className="RowExample">
            <Row>
                <Block static={true}>
                    <div className="RowExample__Left">
                    Left
                    </div>
                </Block>
                <Block>
                    <div className="RowExample__Right">
                    Right
                    </div>
                </Block>
            </Row>
        </div>
        <div className="RowExample">
            <Row>
                <Block static={true}>
                    <div className="RowExample__Left">
                    Left
                    </div>
                </Block>
                <Block>
                    <div className="RowExample__Right">
                    Right
                    </div>
                </Block>
                <Block static={true}>
                    <div className="RowExample__Left">
                    Left
                    </div>
                </Block>
                <Block static={true}>
                    <div className="RowExample__Left">
                    Left
                    </div>
                </Block>
            </Row>
        </div>
        <div className="RowExample">
            <Row height="100%" fix={false}>
                <Block static={true}>
                    <div className="RowExample__Left">
                    Left
                    </div>
                </Block>
                <Block alignSelf={Block.TO_END}>
                    <div className="RowExample__Right">
                    Right
                    </div>
                </Block>
                <Block static={true}>
                    <div className="RowExample__Left">
                    Left
                    </div>
                </Block>
                <Block static={true}>
                    <div className="RowExample__Left">
                    Left
                    </div>
                </Block>
            </Row>
        </div>
        <div className="RowExample">
            <Row height="100%">
                <Column>
                    <Block static={true}>
                        <div className="RowExample__Left">
                            Left
                        </div>
                    </Block>
                    <Block alignSelf={Block.TO_END}>
                        <div className="RowExample__Right">
                            Right
                        </div>
                    </Block>
                    <Block static={true}>
                        <div className="RowExample__Left">
                            Left
                        </div>
                    </Block>
                    <Block static={true}>
                        <div className="RowExample__Left">
                            Left
                        </div>
                    </Block>
                </Column>
            </Row>
        </div>
        <div className="TableExample">
            <Table
                rowHeight={30}
                rowsCount={100000}
                columnWidths={{
                    field1: 100,
                    field2: 300,
                    field3: 100,
                    field4: 150
                }}
                columns={['field1', 'field4', 'field3', 'field2']}
                customRowsHeights={[
                    {
                        index: 1000,
                        height: 500
                    },
                    {
                        index: 1002,
                        height: 500
                    }
                    ,
                    {
                        index: 1121,
                        height: 501
                    }
                    ,
                    {
                        index: 100,
                        height: 50
                    }
                    ,
                    {
                        index: 74,
                        height: 150
                    }
                    ,
                    {
                        index: 99,
                        height: 150
                    }
                ]}
            >
                <TableHeader key="header" />
                <TableMyRow />
                <TableFooter key="footer" />
            </Table>
        </div>
        <div className="InfiniteScrollExample">
            {/*<InfiniteScrollView
                rowHeight={30}
                rowsCount={1000}
                parentWithScrollGetter={() => document.querySelector('.App')}
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
                        index: 100,
                        height: 150
                    }
                ]}
            >  
                <Header key="header" />
                <MyRow />
                <Footer key="footer" />
            </InfiniteScrollView>*/}
        </div>
    </div>,
    document.querySelector('#app')
);
