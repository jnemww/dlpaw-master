
export default function DataTable({ tbodyData, classes, functions, rowclasses }) { 
    
    function theadData(tbodyData){
        let r = Object.keys(tbodyData[0]);
        return r;
    }

return (<table className="pokertableboard">
                <thead>
                    <tr>
                        {theadData(tbodyData).map(heading => { return <th key={heading}>{heading}</th> })} 
                    </tr>
                </thead>
                <tbody> {tbodyData.map((row, index1) => {
                        return  <tr key={index1} className={rowclasses[index1%2]}> {theadData(tbodyData).map((key, index2) => {
                                    return <td onClick={()=>functions[index2](row[key])} key={row[key]} className={classes[index2]}>{row[key]}</td> })}
                                </tr>;
                            })
                        }
                </tbody>
        </table>
    ); 
}