import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, setDoc, doc } from "firebase/firestore";

export default function SignIn({ setToken }) {
    const [email, setEmail] = useState();//REMOVE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    const [password, setPassword] = useState();//REMOVE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    // useEffect(() => {
    //     return () => {
    //         const listRef = ref(strg, "user_photos");
    //         const res = async () => {
                
    //             const f = await listAll(listRef);
    //             f.items.forEach((itemRef) => {
    //                 console.log("item ref: ", itemRef);
    //             });

    //             // .then((res) => {
    //             //     // res.prefixes.forEach((folderRef) => {
    //             //     //     // All the prefixes under listRef.
    //             //     //     // You may call listAll() recursively on them.
    //             //     // });
    //             //     res.items.forEach((itemRef) => {
    //             //         console.log("item ref: ", itemRef);
    //             //     });
    //             // }).catch((error) => {
    //             //     console.log("Error fetching files from storage. => ", error);
    //             // });

    //         };
    //     }
    // }, []);


    const signIn = (e) => {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const userref = collection(db, "users");

                const d = async () => {
                    const tkn = await userCredential.user.getIdToken();
                    setToken(tkn);
                    //console.log(tkn);

                    await setDoc(doc(db, "users", userCredential.user.uid),
                        { email: email });
                    return;
                };
                const p = d.call();

                //return users.doc(userCredential.user.uid).set({email: email});
            }).catch((error) => {
                console.log(error);
            })
    }

    return (
        <div className="sign-in-container">
            <form onSubmit={signIn}>
                <table className="login">
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
                            <button type="submit">Log In</button>
                        </td>
                    </tr>
                </table>
            </form>
        </div>
    );
}
