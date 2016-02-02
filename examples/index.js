import React from 'react';
import {render} from 'react-dom';
import {Column, Block, Row} from '../src';
import {Cell, Table} from '../src/dom-table';
import 'normalize.css';
import '../src/dom/easy-layout.css';
import './index.css';

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
                rowClassNameGetter={(index) => index % 2 ? 'odd' : 'even'}
            >
                <Column
                    header={() => <Cell>
                        ID
                    </Cell>}
                    footer={() => <Cell>
                        huid
                    </Cell>}
                    width="100"
                    static={true}
                    cell={({rowIndex}) => <Cell>
                        id: {rowIndex}
                    </Cell>}
                />
                <Column
                    header={() => <Cell>
                        ID1
                    </Cell>}
                    footer={() => <Cell>
                        huid1
                    </Cell>}
                    cell={({rowIndex}) => <Cell>
                        count: {Math.floor(rowIndex * 1000)}
                    </Cell>}
                />
                <Column
                    header={() => <Cell>
                        ID2
                    </Cell>}
                    footer={() => <Cell>
                        huid2
                    </Cell>}
                    cell={({rowIndex}) => <Cell>
                        asd: {rowIndex + 100500}
                    </Cell>}
                />
                <Column
                    header={() => <Cell>
                        ID3
                    </Cell>}
                    footer={() => <Cell>
                        huid3
                    </Cell>}
                    cell={({rowIndex}) => <Cell>
                        isOdd: {rowIndex % 2 !== 0 ? 'true' : 'false'}
                    </Cell>}
                />
            </Table>
        </div>
    </div>,
    document.querySelector('#app')
);
