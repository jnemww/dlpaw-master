import React, {useEffect} from 'react'
import styled from 'styled-components'
import { useTable, useGroupBy, useExpanded, usePagination } from 'react-table'

//import makeData from './makeData'

// const Styles = styled.div`
//   padding: 1rem;

//     table tr:nth-child(even){background-color: #f2f2f2; opacity: .7;}
//     table tr:nth-child(odd){background-color: white; opacity: .7;}

//   table {
//     border-spacing: 0;
//     border: 1px solid black;

//     tr {
//       :last-child {
//         td {
//           border-bottom: 0;
//         }
//       }
//       :hover {background-color: #ddd;}
//     }

//     th,
//     td {
//       margin: 0;
//       padding: 0.5rem;
//       border-bottom: 1px solid black;
//       border-right: 1px solid black;

//       :last-child {
//         border-right: 0;
//       }
//     }
//   }

// `

export default function GroupedTable({ columns, data }) {
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        nextPage,
        previousPage,
        canNextPage,
        canPreviousPage,
        prepareRow,
        getGroupByToggleProps,
        setGroupBy,
        //state: { groupBy, expanded },
    } = useTable(
        {
            columns,
            data,
            //autoResetExpanded: false,
            initialState: { pageSize: 20}
        },
        useGroupBy,
        useExpanded,
        usePagination // useGroupBy would be pretty useless without useExpanded ;)
    )

    const getLeafColumns = function (rootColumns) {
        return rootColumns.reduce((leafColumns, column)=>{
            if (column.columns) {
                return [...leafColumns, ...getLeafColumns(column.columns)];
            } else {
                return [...leafColumns, column];
            }
        }, []);
      }

    useEffect(() => {
        //console.log(groupBy[0]);
        setGroupBy([columns[0].columns[0].accessor]);
        console.log("react-table mounted");//.groupBy.columns[0].expanded=false;
    },[data]);

    return (
        <>
            {/* <pre>
        <code>{JSON.stringify({ groupBy, expanded }, null, 2)}</code>
      </pre>
      <Legend /> */}
      {/*
       <select
        value={groupBy[0]}
        onChange={e => {
          setGroupBy([e.target.value]);
        }}>
        <option value="">None</option>
        {getLeafColumns(columns).map(column => (
          <option key={column.accessor} value={column.accessor}>{column.Header}</option>
        ))}
      </select>
      */}
            <table {...getTableProps()} className="pokertableboard">
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}
                            style={{background: 'blue', border: '3px', borderstyle: 'solid', color: 'white'}}
                        >
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps()}>
                                    {column.canGroupBy ? (
                                        // If the column can be grouped, let's add a toggle
                                        <span {...column.getGroupByToggleProps()}>
                                            {column.isGrouped ? '→ ' : '↓ '}
                                        </span>
                                    ) : null}
                                    {column.render('Header')}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {page.map((row, i) => {
                        prepareRow(row)
                        return (
                            <tr {...row.getRowProps()}
                                // style={{background: 'blue', border: '3px', borderstyle: 'solid'}}
                            >
                                {row.cells.map(cell => {
                                    return (
                                        <td
                                            // For educational purposes, let's color the
                                            // cell depending on what type it is given
                                            // from the useGroupBy hook
                                            {...cell.getCellProps()}
                                            style={{ background: cell.isGrouped
                                                    ? '#DCDCDC'
                                                    : cell.isAggregated
                                                        ? '#DCDCDC'
                                                        : cell.isPlaceholder
                                                            ? 'white'
                                                            : 'white'}}
                                        >
                                            {cell.isGrouped ? (
                                                // If it's a grouped cell, add an expander and row count
                                                <>
                                                    <span {...row.getToggleRowExpandedProps()}>
                                                        {row.isExpanded ? '↓ ' : '→ '}
                                                    </span>{' '}
                                                    {cell.render('Cell')} ({row.subRows.length})
                                                </>
                                            ) : cell.isAggregated ? (
                                                // If the cell is aggregated, use the Aggregated
                                                // renderer for cell
                                                cell.render('Aggregated')
                                            ) : cell.isPlaceholder ? null : ( // For cells with repeated values, render null
                                                // Otherwise, just render the regular cell
                                                cell.render('Cell')
                                            )}
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            <div style={{ textAlign: "center" }}>
                <button onClick={() => previousPage()} disabled={!canPreviousPage}>Prev</button>
                <button onClick={() => nextPage()} disabled={!canNextPage}>Next</button>
            </div>
        </>
    )
}

function Legend() {
    return (
        <div
            style={{
                padding: '0.5rem 0',
            }}
        >
            <span
                style={{
                    display: 'inline-block',
                    background: '#0aff0082',
                    padding: '0.5rem',
                }}
            >
                Grouped
            </span>{' '}
            <span
                style={{
                    display: 'inline-block',
                    background: '#ffa50078',
                    padding: '0.5rem',
                }}
            >
                Aggregated
            </span>{' '}
            <span
                style={{
                    display: 'inline-block',
                    background: '#ff000042',
                    padding: '0.5rem',
                }}
            >
                Repeated Value
            </span>
        </div>
    )
}

