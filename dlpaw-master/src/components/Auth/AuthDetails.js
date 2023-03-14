import { onAuthStateChanged, signOut } from "firebase/auth";
import React, {useEffect, useState} from "react";
import { auth } from "../../firebase";

export default function AuthDetails({setUser}){
    const [authuser, setAuthuser] = useState(null);

    useEffect(() => {
        const listen = onAuthStateChanged(auth, (user) => {
            if(user){
                setAuthuser(user);
                setUser(user.email);
            } else{
                setAuthuser(null);
            }

        })

        return () => {
            listen();
        }
    }, [])

    const UserSignout = () => {
        signOut(auth).then(() => {
            setUser(null);
            console.log("Signed out.");
        }).catch(error => console.log(error))
    }

    return (
        <>{authuser?<a className="signout" onClick={UserSignout}>{authuser.email}</a>:<p>Signed Out</p>}</>
    )
}

{/* <div>{authuser?<><p>{`Signed In as ${authuser.email}`}</p><button onClick={UserSignout}>Sign Out</button></>:<p>Signed Out</p>}</div> */}