import { useState } from 'react'
import { auth } from '../firebase'
import { User } from 'firebase/auth'
import { useRecoilState } from 'recoil'
import { globalUserState } from '../recoil/atoms'

type Props = {}

const useAuthObserver = () => {
    const [user, setGlobalUser] = useRecoilState(globalUserState)

    auth.onAuthStateChanged(currentUser => {
        if (currentUser) {
            console.log("changed to ", currentUser.displayName);

            setGlobalUser({ uid: currentUser.uid, displayName: currentUser.displayName })
        } else {
            console.log("logout");

            setGlobalUser(null)
        }
    })
    return user

}

export default useAuthObserver