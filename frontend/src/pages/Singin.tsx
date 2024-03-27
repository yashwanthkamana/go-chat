import React, { useState } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, provider } from '../firebase'

type Props = {}

const Singin = (props: Props) => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isSignin, setIsSignin] = useState(true)
    const onSignin = () => {
        signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
            const user = userCredential.user;
            console.log(user);

        })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
            });
    }
    const onSignup = () => {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log(user);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                // ..
            });
    }
    const onGoogleSignin = () => {
        signInWithPopup(auth, provider)
            .then((result) => {
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential?.accessToken;
                const user = result.user;
            }).catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                const email = error.customData.email;
                const credential = GoogleAuthProvider.credentialFromError(error);
            });
    }
    return (
        <div>
            <h2>{isSignin ? "Signin" : "Signup"}</h2>
            <div>
                Email : <input type="email" value={email} placeholder='email' />
                Password : <input type="password" value={password} placeholder='password' />
            </div>
            {isSignin ? <button onClick={onSignin}>Signin</button> : <button onClick={onSignup}>Signup</button>}
            <h6 className='text-xs'>OR login through Google</h6>
            <p><button onClick={onGoogleSignin}>Google</button></p>
        </div>
    )
}

export default Singin