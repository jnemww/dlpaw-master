import { onAuthStateChanged, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth, app } from "../../firebase";
import { getStorage, getDownloadURL, ref } from "firebase/storage";

export default function AuthDetails({ setUser }) {
    const [authuser, setAuthuser] = useState(null);
    const [profileimg, setProfileimg] = useState(null);

    useEffect(() => {
        const listen = onAuthStateChanged(auth, (user) => {
            if (user) {

                let nuser = {username: user.email, photourl: ""};
                const storage = getStorage(app);
                const pref = ref(storage, "user_photos/" + user.email.split("@")[0] + ".png");

                // Get the download URL
                getDownloadURL(pref)
                    .then((url) => {
                        setProfileimg(url);
                        nuser.photourl = url;
                        //console.log("profile url is: ", url);
                    })

                setAuthuser(user);
                setUser(nuser);
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
        <>{authuser ? <a className="signout" onClick={UserSignout}><img height={38} width={38} src={profileimg} /></a> : <p>Signed Out</p>}</>
    )
}

{/* <div>{authuser?<><p>{`Signed In as ${authuser.email}`}</p><button onClick={UserSignout}>Sign Out</button></>:<p>Signed Out</p>}</div> */ }