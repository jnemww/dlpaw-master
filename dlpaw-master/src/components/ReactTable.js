import React, { useMemo } from 'react';
import { useTable, useSortBy, usePagination, useGroupBy, useExpanded } from 'react-table';

export default function ReactTable({ columns, data }) {
    //const rcolumns = useMemo(() => columns,[]);//cgroups, []);
    //const rdata = useMemo(() => data, []);

    // Use the useTable Hook to send the columns and data to build the table
    const { getTableProps, // table props from react-table
            getTableBodyProps, // table body props from react-table
            headerGroups, // headerGroups, if your table has groupings
            page, // rows for the table based on the data passed
            nextPage,
            previousPage,
            canNextPage,
            canPreviousPage,
            prepareRow // Prepare the row (this function needs to be called for each row before getting the row props)
        } = useTable({ columns: columns, data: data }, useSortBy, usePagination, useGroupBy, useExpanded);

    console.log("");

    /* 
      Render the UI for your table
      - react-table doesn't have UI, it's headless. We just need to put the react-table props from the Hooks, and it will do its magic automatically
    */
    return (
        <>
            <table {...getTableProps()}>
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                                    {column.render("Header")}
                                    <span>
                                        {column.isSorted ?(column.isSortedDesc?"*d*":"*a*"):""}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {page.map((row, i) => {
                        prepareRow(row);
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => {
                                    return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div>
                <button onClick={() => previousPage()} disabled={!canPreviousPage}>Prev</button>
                <button onClick={() => nextPage()} disabled={!canNextPage}>Next</button>
            </div>
        </>
    );
}