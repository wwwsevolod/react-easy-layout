import React from 'react';
import {render} from 'react-dom';
import {Column, Block, Row} from '../src';
import {InfiniteScrollView} from '../src/dom-infinite-scroll-view';
import {Table} from '../src/dom-table';
import 'normalize.css';
import '../src/dom/easy-layout.css';
import './index.css';

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

function Test({width}) {
    return <span>{width}</span>;
}

function TableFooter({height}) {
    return <Table.Row index={-2} height={height}>
        <Table.Cell field="field2">
            <Test />
        </Table.Cell>
        <Table.Cell field="field3">
            Foot3
        </Table.Cell>
    </Table.Row>;
}

function TableRow(props) {
    const {
        index,
        height
    } = props;

    return <Table.Row
        {...props}
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
        <Table.Cell field="field5">
            id: {index}
        </Table.Cell>
        <Table.Cell field="field6">
            count: {Math.floor(index * 1000)}
        </Table.Cell>
        <Table.Cell field="field7">
            asd: {index + 100500}
        </Table.Cell>
        <Table.Cell field="field8">
            id: {index}
        </Table.Cell>
        <Table.Cell field="field9">
            count: {Math.floor(index * 1000)}
        </Table.Cell>
        <Table.Cell field="field10">
            asd: {index + 100500}
        </Table.Cell>
        <Table.Cell field="field11">
            isOdd: {index % 2 !== 0 ? 'true' : 'false'}
        </Table.Cell>
        <Table.Cell field="field12">
            id: {index}
        </Table.Cell>
        <Table.Cell field="field13">
            count: {Math.floor(index * 1000)}
        </Table.Cell>
        <Table.Cell field="field14">
            asd: {index + 100500}
        </Table.Cell>
        <Table.Cell field="field15">
            isOdd: {index % 2 !== 0 ? 'true' : 'false'}
        </Table.Cell>
        <Table.Cell field="field16">
            id: {index}
        </Table.Cell>
        <Table.Cell field="field17">
            count: {Math.floor(index * 1000)}
        </Table.Cell>
        <Table.Cell field="field18">
            asd: {index + 100500}
        </Table.Cell>
        <Table.Cell field="field19">
            isOdd: {index % 2 !== 0 ? 'true' : 'false'}
        </Table.Cell>
    </Table.Row>;
}

render(
    <div className="App">
        <div className="TableExample">
            <Table
                rowHeight={30}
                rowsCount={100000}
                columnWidths={{
                    field1: 50,
                    field2: 150,
                    field3: 50,
                    field4: 85,
                    field5: 100,
                    field6: 150,
                    field7: 50,
                    field8: 50,
                    field9: 85,
                    field10: 50,
                    field11: 85,
                    field12: 50,
                    field13: 85,
                    field14: 50,
                    field15: 100,
                    field16: 100,
                    field17: 100,
                    field18: 100,
                    field19: 100
                }}
                columns={[
                    'field1', 'field2', 'field3', 'field4', 'field5', 'field6',
                    'field7', 'field8', 'field9', 'field10', 'field11',
                    'field12', 'field13', 'field14', 'field15',
                    'field16', 'field17', 'field18', 'field19'
                ]}

                renderRow={(props) => <TableRow {...props} />}
            />
        </div>
    </div>,
    document.querySelector('#app')
);
