import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { clearToken, loadToken, saveToken } from '../services/auth';
import type { LoginResponse, Member } from '../types';

interface AuthValue {
    /** 저장된 토큰을 확인하는 중. 이 동안에는 화면을 그리지 않는다 */
    loading: boolean;
    /** 로그인한 회원. 비로그인이면 null */
    member: Member | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [member, setMember] = useState<Member | null>(null);

    // 앱이 켜질 때 한 번. 저장된 토큰이 아직 쓸 수 있는지 서버에 물어본다.
    useEffect(() => {
        (async () => {
            try {
                const token = await loadToken();
                if (token) {
                    // 토큰이 만료·위조되었으면 401 이 나고, api.ts 가 토큰을 지운다
                    setMember(await api.get<Member>('/members/me'));
                }
            } catch {
                // 만료됐거나 서버가 꺼져 있는 경우. 비로그인으로 시작한다
                setMember(null);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    async function login(email: string, password: string) {
        const res = await api.post<LoginResponse>('/auth/login', { email, password });
        // 토큰을 먼저 저장한다. 순서가 바뀌면 화면이 먼저 넘어가고 요청이 401 로 실패한다
        await saveToken(res.token);
        setMember(res.member);
    }

    async function logout() {
        await clearToken();
        setMember(null);
    }

    return (
        <AuthContext.Provider value={{ loading, member, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthValue {
    const value = useContext(AuthContext);
    if (!value) {
        throw new Error('useAuth 는 AuthProvider 안에서만 쓸 수 있습니다');
    }
    return value;
}