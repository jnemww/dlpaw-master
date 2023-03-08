import React, { useEffect, useState, useSyncExternalStore } from 'react';

export default function Login({setUser, setTokens}) {
    const [localuser, setLocalUser] = useState();
    const [localpassword, setLocalPassword] = useState();
    const [localtokens, setLocaltokens] = useState();
    const [loginerror, setLoginerror] = useState();
    let bloginerror = false;

    useEffect(()=>{ 
                
    },[]);

async function authenticateUser(){
    console.log("user auth attempt: " + localuser)
    var f = await fetch("http://192.168.1.155:4000/login",
        {
            method: "POST",
            mode: "cors",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username: localuser, password: localpassword})
        })
        .then(res => {
            if(res.status !== 200) bloginerror = true;
            return res.json();
        })
        .then(data => {
            if(bloginerror){
                setLoginerror(data.message);
            }else{
                setLocaltokens(data);
                setTokens(data);
                setUser(localuser);
                console.log("user: " + localuser + ", pwd: " + localpassword)
                console.log(data);
            }   
        })
        .catch(error => {
            setLoginerror(error.toString());
            console.log(error.toString());
        });
}

return (
            <div>
                <table className="login">
                    <div>
                        <label htmlFor="username">Login</label>
                        <input id="username" name="username" required onChangeCapture={(e) => setLocalUser(e.target.value)}/>
                    </div>
                    <div>
                        <label htmlFor="password">Password</label>
                        <input id="password" name="password" type="password" required onChangeCapture={(e) => setLocalPassword(e.target.value)}/>
                    </div>
                    <div>
                        <button onClick={authenticateUser}>Login</button>
                    </div>
                    {//JSON.stringify(localtokens)
                        loginerror &&
                        <div>Login Error: {loginerror}</div>   
                    }
                </table>
            </div>
);}