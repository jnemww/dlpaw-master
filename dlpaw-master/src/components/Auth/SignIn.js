import React, { useState, useEffect } from "react";
import { auth, storage, app } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { listAll, ref, getDownloadURL } from "firebase/storage";

export default function SignIn({ setToken, setUser, setLeaguemembers }) {
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [loginerror, setLoginerror] = useState();

    useEffect(() => {
        //setToken(null);

        return (() => {
            if (!auth) return;

            console.log("sign.js is unmounted.");

            // let imgrefs = [];
            // let imgs = [];
            // let players = [];

            // const db = getFirestore();
            // const q = collection(db, "users");

            // console.log("user email(1) => ", email);

            // const querySnapshot = getDocs(q)
            //     .then(res => {
            //         res.forEach((doc) => {
            //             // doc.data() is never undefined for query doc snapshots
            //             //console.log("user collection => ", doc.id, " => ", doc.data());
            //             players.push(doc.data());
            //         });
            //     })
            //     .catch((error) => {
            //         console.log("getDocs => ", error)
            //     })
            //     .finally(() => {
            //         const listRef = ref(storage, 'user_photos');
            //         // Find all the prefixes and items.
            //         listAll(listRef)
            //             .then((res) => {
            //                 res.items.forEach((itemRef) => {
            //                     imgrefs.push(itemRef);
            //                 });
            //             })
            //             .catch((error) => {
            //                 console.log(error);
            //             })
            //             .finally(() => {
            //                 const y = imgrefs.forEach(imgref => {
            //                     const x = getDownloadURL(imgref)
            //                         .then((url) => {
            //                             let n = 0;
            //                             players.forEach(p => {
            //                                 let uid = p.email.split("@")[0];
            //                                 if (url.search(uid) >= 0) {
            //                                     players[n] = { ...players[n], ...{ url: url } };
            //                                     //break;
            //                                 }
            //                                 n++;
            //                             })
            //                             imgs.push(url);
            //                             //console.log("profile url is: ", url);
            //                         })
            //                     setLeaguemembers(players);
            //                 })
            //             });
            //     });
            console.log("user email(2) => ", email);
        })

    }, []);


    const signIn = (e) => {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                userCredential.user.getIdToken()
                    .then(t => {
                        if (t == null || t == undefined) {
                            setLoginerror("Could not obtain login token. Refresh browser and try again.");
                            return;
                        }

                        console.log("user email, token => ", email, t);
                        let imgrefs = [];
                        let imgs = [];
                        let players = [];

                        const db = getFirestore();
                        const q = collection(db, "users");

                        console.log("user email(1) => ", email);

                        const querySnapshot = getDocs(q)
                            .then(res => {
                                res.forEach((doc) => {
                                    // doc.data() is never undefined for query doc snapshots
                                    //console.log("user collection => ", doc.id, " => ", doc.data());
                                    players.push(doc.data());
                                });
                            })
                            .catch((error) => {
                                console.log("getDocs => ", error)
                            })
                            .finally(() => {
                                const listRef = ref(storage, 'user_photos');
                                // Find all the prefixes and items.
                                listAll(listRef)
                                    .then((res) => {
                                        res.items.forEach((itemRef) => {
                                            imgrefs.push(itemRef);
                                        });
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                    })
                                    .finally(() => {
                                        const y = imgrefs.forEach(imgref => {
                                            const x = getDownloadURL(imgref)
                                                .then((url) => {
                                                    let n = 0;
                                                    players.forEach(p => {
                                                        let uid = p.email.split("@")[0];
                                                        if (url.search(uid) >= 0) {
                                                            players[n] = { ...players[n], ...{ url: url } };
                                                            //break;
                                                        }
                                                        n++;
                                                    })
                                                    imgs.push(url);
                                                    //console.log("profile url is: ", url);
                                                })
                                            setLeaguemembers(players);
                                            setToken(t);
                                            setUser(email);
                                        })
                                    });
                            });
                    });
                // // const d = async () => {
                // const d = () => {
                //     // const tkn = await userCredential.user.getIdToken();
                //     //setToken(tkn);
                //     const tkn = userCredential.user.getIdToken()
                //         .then(t => {setToken(tkn);});
                //     // const userref = collection(db, "users");
                //     // await setDoc(doc(db, "users", userCredential.user.uid),
                //     //     { email: email });
                //     return;
                // };
                // const p = d.call();

                //return users.doc(userCredential.user.uid).set({email: email});
            }).catch((error) => {
                setLoginerror(error);
                console.log(error);
            })
    }

    return (
        <div className="sign-in-container">
            {/* <form onSubmit={signIn}> */}
            <form>
                <table className="login">
                    <tbody>
                        <tr>
                            <td>
                                <input type="email"
                                    placeholder="Enter email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}

                                />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <input type="password"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)} />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {/* <button type="submit">Log In</button> */}
                                <button onClick={signIn}>Log In</button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {loginerror &&
                                    <div>Login Error: {loginerror}</div>
                                }
                            </td>
                        </tr>
                    </tbody>
                </table>
            </form>
        </div>
    );
}
