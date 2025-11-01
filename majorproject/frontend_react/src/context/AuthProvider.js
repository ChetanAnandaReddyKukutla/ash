import {createContext, useState, useEffect} from "react";

const AuthContext = createContext({});

export const AuthProvider = ({children}) => {
    const [auth, setAuth] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    // Load auth state from localStorage on component mount
    useEffect(() => {
        const savedAuth = localStorage.getItem('auth');
        console.log('Loading auth from localStorage:', savedAuth);
        if (savedAuth) {
            try {
                const parsedAuth = JSON.parse(savedAuth);
                console.log('Parsed auth:', parsedAuth);
                setAuth(parsedAuth);
            } catch (error) {
                console.error('Error parsing saved auth:', error);
                localStorage.removeItem('auth');
            }
        }
        setIsLoading(false);
    }, []);

    // Save auth state to localStorage whenever it changes
    useEffect(() => {
        if (auth && Object.keys(auth).length > 0) {
            localStorage.setItem('auth', JSON.stringify(auth));
        } else {
            localStorage.removeItem('auth');
        }
    }, [auth]);

    const setAuthData = (authData) => {
        setAuth(authData);
    };

    const clearAuth = () => {
        setAuth({});
        localStorage.removeItem('auth');
    };

    return (
        <AuthContext.Provider value={{auth, setAuth: setAuthData, clearAuth, isLoading}}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;