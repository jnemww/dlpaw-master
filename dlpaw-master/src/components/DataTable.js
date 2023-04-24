import {useEffect} from "react";

export default function DataTable({ tbodyData, classes, functions, rowclasses, tableheader="tableheader", columns = [] }) { 
    useEffect(() => {
        return () => {
            // Anything in here is fired on component unmount.
            console.log("Data table unmounted.");
        }
    }, []);

    function theadData(tbodyData){
        let r = {};
        if(columns.length==0)
            r = Object.keys(tbodyData[0]);
        else
            r = columns;
        return r;
    }

return (<table className="pokertableboard">
                <thead>
                    <tr>
                        {theadData(tbodyData).map(heading => { return <th className={tableheader} key={heading}>{heading}</th> })} 
                    </tr>
                </thead>
                <tbody> {tbodyData.map((row, index1) => {
                        return  <tr key={index1} className={rowclasses[index1%2]}> {theadData(tbodyData).map((key, index2) => {
                                    return <td onClick={()=>functions[index2](row[key])} key={row[key] + "_" + index2} className={classes[index2]}>{row[key]}</td> })}
                                </tr>;
                            })
                        }
                </tbody>
        </table>
    ); 
}