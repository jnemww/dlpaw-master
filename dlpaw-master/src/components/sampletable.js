import React, {useMemo} from 'react';
import {useTable, useSortBy} from 'react-table';
import mydata from './data.json';
import "./sampletable.css";


export default function SampleTable() {
    const mycolumns = [
        {Header: "Id", accessor: "id"},
        {Header: "First Name", accessor: "first_name"},
        {Header: "Last Name", accessor: "last_name"},
        {Header: "Date of Birth", accessor: "date_of_birth"},
        {Header: "Country", accessor: "country", Footer: "Country"},
    ];
    const cgroups = [
            {Header: "Id", Footer: "Id", accessor: "id"},
            {
                Header: "Name",
                Footer: "Name",
                columns: [
                    {Header: "First Name", Footer: "First Name", accessor: "first_name"},
                    {Header: "Last Name", Footer: "Last Name", accessor: "last_name"}
                ]
            },
            {
                Header: "Info",
                Footer: "Info",
                columns: [
                    {Header: "Date of Birth", accessor: "date_of_birth"},
                    {Header: "Country", accessor: "country", Footer: "Country"}
                ]
            }
    ];
    const columns = useMemo(() => mycolumns,[]);//cgroups, []);
    const data = useMemo(() => mydata, []);

    const { 
        getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, footerGroups } = 
            useTable({columns: columns, data: data 
    }, useSortBy);

    function getValue(rw, field){
        //console.log("rw=> ", rw);
        //return (<span>{rw.row.values.first_name}</span>);
        //return value.row.cells.filter(c=>c.column.Header==field)[0].value;
        return (<table>
                    <tr>
                        <td>{rw.row.values.first_name}</td>
                        <td>{rw.row.values.last_name}</td>
                    </tr>
                    <tr>
                        <td>{rw.row.values.country}</td>
                        <td>{rw.row.values.date_of_birth}</td>
                    </tr>
                </table>);
    }
    return (
        <table {...getTableProps()}>
            <thead>
                {headerGroups.map(hg => (
                    <tr {...hg.getHeaderGroupProps()}>
                        {hg.headers.map((col) => (
                            <th {...col.getHeaderProps(col.getSortByToggleProps())}>
                                {col.render("Header")}
                                <span>
                                    {col.isSorted ?(col.isSortedDesc?"*d*":"*a*"):""}
                                </span>
                            </th>
                        ))}
                    </tr>
                ))
                }
            </thead>
            <tbody {...getTableBodyProps()}>
                {
                    rows.map(rw => {
                        prepareRow(rw);
                        return (
                            <tr {...rw.getRowProps()}>
{/* 
                                    {[...Array(1)].forEach(() => {
                                        //console.log("rw=",rw);
                                        //let r = getValue(rw);
                                        return (<td  {...rw.cells[0].getCellProps()}>{getValue(rw,"")}</td>);
                                    })}
 */}
                                {rw.cells.map((cell) => {
                                    return <td {...cell.getCellProps()}>{cell.render((rw) => {
                                        if(cell.column.index > 0){
                                            return (<></>)
                                        } else {
                                            return (getValue(rw, ""));
                                        }
                                    })}</td>
                                    })
                                }
{/*                                     
                                {rw.cells.map((cell) => {
                                    return <td {...cell.getCellProps()}>{cell.render((rw) => {
                                        return (    <table>
                                                        <tr>
                                                            <td>{getValue(rw, "First Name")}</td>
                                                            <td>{getValue(rw, "Last Name")}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>{getValue(rw, "Country")}</td>
                                                            <td>{getValue(rw, "Date of Birth")}</td>
                                                        </tr>
                                                    </table>);
                                    })}</td>
                                    })
                                }
                                */}
                            </tr>
                        )
                    })
                }
            </tbody>
            <tfoot>
                {
                    footerGroups.map((fg) => (
                        <tr {...fg.getFooterGroupProps()}>
                            {
                                fg.headers.map(col => (
                                    <td {...col.getFooterGroupProps}>
                                        {
                                            col.render("Footer")
                                        }
                                    </td>
                                ))    
                            }
                        </tr>
                    ))
                }
            </tfoot>
        </table>
    );
}