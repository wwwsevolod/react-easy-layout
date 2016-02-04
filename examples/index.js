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
                rowsCount={10000}
                rowClassNameGetter={(index) => index % 2 ? 'odd' : 'even'}

                header={() => <Table.Row
                    key="__header__"
                >
                    <Table.Cell static={true} width="100px">
                        ID
                    </Table.Cell>
                    <Table.Cell static={true} width="200px">
                        ID1
                    </Table.Cell>
                    <Table.Cell static={true} width="100px">
                        ID2
                    </Table.Cell>
                    <Table.Cell>
                        ID3
                    </Table.Cell>
                    <Table.Cell static={true} width="100px">
                        ID
                    </Table.Cell>
                    <Table.Cell static={true} width="200px">
                        ID1
                    </Table.Cell>
                    <Table.Cell static={true} width="100px">
                        ID2
                    </Table.Cell>
                    <Table.Cell>
                        ID3
                    </Table.Cell>
                </Table.Row>}

                row={({rowIndex}) => <Table.Row
                    key={'row' + rowIndex}
                    height="30px"
                >
                    <Table.Cell static={true} width="100px">
                        id: {rowIndex}
                    </Table.Cell>
                    <Table.Cell static={true} width="200px">
                        count: {Math.floor(rowIndex * 1000)}
                    </Table.Cell>
                    <Table.Cell static={true} width="100px">
                        asd: {rowIndex + 100500}
                    </Table.Cell>
                    <Table.Cell>
                        isOdd: {rowIndex % 2 !== 0 ? 'true' : 'false'}
                    </Table.Cell>
                    <Table.Cell static={true} width="100px">
                        id: {rowIndex}
                    </Table.Cell>
                    <Table.Cell static={true} width="200px">
                        count: {Math.floor(rowIndex * 1000)}
                    </Table.Cell>
                    <Table.Cell static={true} width="100px">
                        asd: {rowIndex + 100500}
                    </Table.Cell>
                    <Table.Cell>
                        isOdd: {rowIndex % 2 !== 0 ? 'true' : 'false'}
                    </Table.Cell>
                </Table.Row>}

                footer={() => <Table.Row
                    key="__footer__"
                >
                    <Table.Cell static={true} width="100px">
                        footer
                    </Table.Cell>
                    <Table.Cell static={true} width="200px">
                        footer1
                    </Table.Cell>
                    <Table.Cell static={true} width="100px">
                        footer2
                    </Table.Cell>
                    <Table.Cell>
                        footer3
                    </Table.Cell>
                    <Table.Cell static={true} width="100px">
                        footer
                    </Table.Cell>
                    <Table.Cell static={true} width="200px">
                        footer1
                    </Table.Cell>
                    <Table.Cell static={true} width="100px">
                        footer2
                    </Table.Cell>
                    <Table.Cell>
                        footer3
                    </Table.Cell>
                </Table.Row>}
            />
        </div>
    </div>,
    document.querySelector('#app')
);
