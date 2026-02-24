import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus, ArrowLeft } from 'lucide-react';

export function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetSuccess(false);
    setLoading(true);

    try {
      if (isResetPassword) {
        await resetPassword(email);
        setResetSuccess(true);
        setEmail('');
      } else if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
        {!isResetPassword && (
          <div className="flex items-center justify-center mb-8">
            <img src="/scan_4237488.png" alt="Scanner" className="w-16 h-16" />
          </div>
        )}

        {isResetPassword && (
          <button
            onClick={() => {
              setIsResetPassword(false);
              setResetSuccess(false);
              setError('');
            }}
            className="flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium transition mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        )}

        {resetSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <p className="text-green-700 dark:text-green-400 font-medium">
              Link de recuperação enviado! Verifique seu email.
            </p>
          </div>
        )}

        <h1 className="text-3xl font-bold text-center mb-2 text-slate-800 dark:text-white">
          {isResetPassword ? 'Recuperar Senha' : isSignUp ? 'Criar Conta' : 'Entrar'}
        </h1>
        <p className="text-center text-slate-600 dark:text-slate-400 mb-8">
          Gerenciador de Códigos de Barras
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
              placeholder="seu@email.com"
            />
          </div>

          {!isResetPassword && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              'Processando...'
            ) : isResetPassword ? (
              'Enviar Link de Recuperação'
            ) : (
              <>
                {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                {isSignUp ? 'Criar Conta' : 'Entrar'}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center">
          {!isResetPassword && (
            <button
              onClick={() => setIsResetPassword(true)}
              className="block w-full text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium transition text-sm"
            >
              Esqueceu a senha?
            </button>
          )}
          {!isResetPassword && (
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="block w-full text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium transition"
            >
              {isSignUp ? 'Já tem uma conta? Entre' : 'Não tem conta? Cadastre-se'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
