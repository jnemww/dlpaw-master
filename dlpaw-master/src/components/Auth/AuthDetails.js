import { onAuthStateChanged, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth, app } from "../../firebase";
import { getStorage, getDownloadURL, ref } from "firebase/storage";

export default function AuthDetails({userimageref, setUser}) {
    const [authuser, setAuthuser] = useState(null);
    const [profileimg, setProfileimg] = useState(userimageref);

    useEffect(() => {
        const listen = onAuthStateChanged(auth, (user) => {
            if (user) {
                setAuthuser(user);
            } else {
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
        <>{authuser ? <a className="signout" onClick={UserSignout}><img height={38} width={38} src={userimageref} /></a> : <p>Signed Out</p>}</>
    )
}

{/* <div>{authuser?<><p>{`Signed In as ${authuser.email}`}</p><button onClick={UserSignout}>Sign Out</button></>:<p>Signed Out</p>}</div> */ }