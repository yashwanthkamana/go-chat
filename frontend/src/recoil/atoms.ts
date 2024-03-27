import { User } from 'firebase/auth'
import { atom } from 'recoil'
import { recoilPersist } from 'recoil-persist'
import { MessageType } from '../utils/types'

const { persistAtom } = recoilPersist()

export const globalUserState = atom<Partial<User> | null>({
    key: "globalUserState",
    default: null,
    effects_UNSTABLE: [persistAtom],
})
export const globalUsersListState = atom<Partial<User>[]>({
    key: "globalUsersListState",
    default: [],
    effects_UNSTABLE: [persistAtom],
})
export const globalMessagesListState = atom<Partial<MessageType>[]>({
    key: "globalMessagesListState",
    default: [],
    effects_UNSTABLE: [persistAtom],
})