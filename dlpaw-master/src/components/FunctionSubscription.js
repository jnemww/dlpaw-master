import React, { useState } from 'react';

//export default function FunctionSubscription(props) {
export const FunctionSubscription = (props) => {
    const [canUse, setCanUse] = useState(false);
    const [subCode, setSubCode] = useState();
    const [hasPermission, setHasPermission] = useState(false);
    isPermitted.value = hasPermission;

    function isSubscribed(){
        let sum = 0;
        if(subCode){
            [...subCode].forEach(l => {
                sum += l.charCodeAt(0);
            })
        }
        setHasPermission(sum == 304);
        isPermitted.value = sum == 304;//{value: sum == 304};
        return sum == 304;
    }

    return (
        <>
            {!hasPermission &&
                <table className='pokertableboard'>
                    <tr style={{backgroundColor: "gainsboro", color: "blue", fontWeight: "bold"}}>
                        <td colSpan={3}>{`Ask your Donk League Administrator`}</td>
                    </tr>
                    <tr style={{backgroundColor: "gainsboro", color: "blue", fontWeight: "bold"}}>
                        <td colSpan={3}>{`about the Subscription Pass to use`}</td>
                    </tr>
                    <tr style={{backgroundColor: "gainsboro", color: "blue", fontWeight: "bold"}}>
                        <td colSpan={3}>{`to use this function and others. Else enter`}</td>
                    </tr>
                    <tr style={{backgroundColor: "gainsboro", color: "blue", fontWeight: "bold"}}>
                        <td colSpan={3}>{`code to proceed.`}</td>
                    </tr>
                    <tr style={{backgroundColor: "gainsboro", color: "red", fontWeight: "bold"}}>
                        <td>{`Enter Subscription Code: `}</td>
                        <td><input onChange={(e) => setSubCode(e.target.value)}></input></td>
                        <td><button onClick={() => setCanUse(isSubscribed())}>Enter</button></td>
                    </tr>
                    <tr style={{backgroundColor: "gainsboro", color: "blue", fontWeight: "bold"}}>
                        <td colSpan={3}>Permission Granted = {isPermitted.value.toString()}</td>
                    </tr>
                </table>
        }
        {
            hasPermission &&
                <div>{props.children}</div>
        }
        </>
    );
}
export const isPermitted = {value: false};

// exports.MyValue = MyValue;
// exports.FunctionSubscription = FunctionSubscription;
//exports.canUse = canUse;