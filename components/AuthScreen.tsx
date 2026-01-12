import React, { useState } from 'react';
import { Mail, Lock, User, Chrome, ArrowRight, Eye, EyeOff, CheckSquare, Square } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (username: string, isAdmin: boolean) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [view, setView] = useState<'LOGIN' | 'SIGNUP' | 'FORGOT'>('LOGIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (view === 'FORGOT') {
        if (!email) return;
        setIsLoading(true);
        setTimeout(() => {
            setResetSent(true);
            setIsLoading(false);
        }, 1500);
        return;
    }

    if (!username || !password) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
        const isAdmin = username.toLowerCase() === 'admin';
        onLogin(username, isAdmin);
        setIsLoading(false);
    }, 1500);
  };

  const handleGoogleLogin = () => {
      setIsLoading(true);
      setTimeout(() => {
          onLogin("GoogleUser_" + Math.floor(Math.random()*1000), false);
          setIsLoading(false);
      }, 2000);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
            <div className="text-center mb-10">
                <h1 className="text-6xl font-black brand-font italic tracking-tighter text-white mb-2 neon-text-red">
                    FAST <span className="text-red-600">&</span> FURIOUS
                </h1>
                <p className="text-xl text-gray-400 font-mono tracking-widest uppercase">
                    Gaming Zone
                </p>
            </div>

            <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">
                {/* Tabs */}
                {view !== 'FORGOT' && (
                    <div className="flex mb-8 bg-black/50 p-1 rounded-lg">
                        <button 
                            onClick={() => setView('LOGIN')}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${view === 'LOGIN' ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            LOGIN
                        </button>
                        <button 
                            onClick={() => setView('SIGNUP')}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${view === 'SIGNUP' ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            SIGN UP
                        </button>
                    </div>
                )}

                {view === 'FORGOT' && (
                     <div className="mb-6 text-center">
                         <h3 className="text-white font-bold text-xl mb-2">Reset Password</h3>
                         <p className="text-gray-400 text-sm">Enter your email to receive a reset link.</p>
                     </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {view === 'FORGOT' ? (
                         !resetSent ? (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                    <input 
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-red-500 focus:outline-none transition-all"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>
                         ) : (
                             <div className="bg-green-900/30 border border-green-500 p-4 rounded-xl text-green-400 text-center text-sm">
                                 Check your email for the reset link!
                             </div>
                         )
                    ) : (
                        <>
                             {/* Login/Signup Fields */}
                            {view === 'SIGNUP' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                        <input 
                                            type="email"
                                            className="w-full bg-black border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-red-500 focus:outline-none transition-all"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Username</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                    <input 
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-black border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-red-500 focus:outline-none transition-all"
                                        placeholder="Username"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black border border-gray-700 rounded-xl py-3 pl-10 pr-10 text-white focus:border-red-500 focus:outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-500 hover:text-white">
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <button type="button" onClick={() => setRememberMe(!rememberMe)} className="flex items-center gap-2 text-gray-400 hover:text-white">
                                    {rememberMe ? <CheckSquare className="w-4 h-4 text-red-500" /> : <Square className="w-4 h-4" />}
                                    Remember Me
                                </button>
                                <button type="button" onClick={() => setView('FORGOT')} className="text-red-500 hover:text-red-400">
                                    Forgot Password?
                                </button>
                            </div>
                        </>
                    )}

                    <button 
                        type="submit"
                        disabled={isLoading || (view === 'FORGOT' && resetSent)}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : view === 'FORGOT' ? (
                             resetSent ? "EMAIL SENT" : "SEND RESET LINK"
                        ) : (
                            <>
                                {view === 'LOGIN' ? 'ENTER HUB' : 'CREATE ACCOUNT'} <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                    
                    {view === 'FORGOT' && (
                        <button type="button" onClick={() => { setView('LOGIN'); setResetSent(false); }} className="w-full text-center text-gray-500 hover:text-white text-sm">
                            Back to Login
                        </button>
                    )}
                </form>

                {view !== 'FORGOT' && (
                    <>
                        <div className="flex items-center gap-4 my-6">
                            <div className="h-px bg-gray-800 flex-1"></div>
                            <span className="text-xs text-gray-500 uppercase">Or continue with</span>
                            <div className="h-px bg-gray-800 flex-1"></div>
                        </div>

                        <button 
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-3 transition-transform hover:scale-105"
                        >
                            <Chrome className="w-5 h-5" />
                            Google
                        </button>
                    </>
                )}
            </div>
            
            <p className="text-center text-gray-600 text-xs mt-6">
                By entering, you agree to our Terms of Service. <br/>
                Admin Fees apply to all financial transactions.
            </p>
        </div>
    </div>
  );
};