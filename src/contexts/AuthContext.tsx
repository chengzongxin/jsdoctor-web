import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  email?: string;
  is_active: boolean;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 从localStorage恢复认证状态并验证token
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (savedToken && savedUser) {
          // 先设置token，避免重复验证
          setToken(savedToken);
          
          try {
            // 验证token有效性
            const response = await fetch('/api/auth/me', {
              headers: {
                'token': savedToken,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              const responseData = await response.json();
              if (responseData.code === 1 && responseData.data) {
                // token有效，设置用户信息
                setUser(responseData.data);
                localStorage.setItem('user', JSON.stringify(responseData.data));
              } else {
                // token无效，清除存储的信息
                throw new Error('Token validation failed');
              }
            } else {
              // 请求失败，清除存储的信息
              throw new Error('Token validation request failed');
            }
          } catch (error) {
            console.error('Token validation failed:', error);
            // 清除无效的认证信息
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // 确保清除所有认证信息
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || '登录失败');
      }

      const data = await response.json();
      
      // 新的后端返回格式：{"code":1,"msg":"success","data":"token字符串"}
      if (data.code === 1 && data.data) {
        // 设置token
        setToken(data.data);
        localStorage.setItem('token', data.data);
        
        // 设置临时用户信息
        const tempUser = { 
          id: 0,
          username: username,
          is_active: true,
          is_admin: false
        };
        setUser(tempUser);
        
        // 获取完整的用户信息
        try {
          const userResponse = await fetch('/api/auth/me', {
            headers: {
              'token': data.data,
              'Content-Type': 'application/json',
            },
          });

          if (userResponse.ok) {
            const userResponseData = await userResponse.json();
            if (userResponseData.code === 1 && userResponseData.data) {
              setUser(userResponseData.data);
              localStorage.setItem('user', JSON.stringify(userResponseData.data));
            }
          }
        } catch (error) {
          console.error('Failed to get user info:', error);
          // 即使获取用户信息失败，也保持登录状态
        }
        
        return true;
      } else {
        throw new Error(data.msg || '登录失败');
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user && !!token,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 