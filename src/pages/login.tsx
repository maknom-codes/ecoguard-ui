import React, { useState } from 'react';
import { Mail, Lock, UserPlus, LogIn, ShieldCheck, TreePine } from 'lucide-react';
import { authService } from '../services/auth-service';
import { useNavigate } from 'react-router-dom';


const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: 'carlos.baleba@gmail.com',
        password: 'carlos',
        role: 'ADMIN'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log(isLogin ? "Sign In..." : "Register...", formData);
        if (isLogin) {
            authService.handleLogin (formData.email, formData.password)
                .then((resp) => {
                    if (resp.login.success) {
                        navigate('/dashboard');
                    } else {
                        console.log('Failed to connect verify your credentials')
                    }
                }).catch((e) => console.error('ERROR: Could not extract token', e))
            
        } else {
            authService.register (formData)
                .then((resp) => {
                    if (resp.register.success) {
                        navigate('/dashboard');
                    } else {
                        console.log('Failed to connect verify your credentials')
                    }
                }).catch((e) => console.error('ERROR: Could not extract token', e))
        }

    };

    return (
        <div className="min-h-screen bg-emerald-50 flex flex-col justify-center items-center p-4">
            <div className="mb-8 text-center">
                <div className="inline-flex p-3 rounded-full bg-emerald-600 text-white mb-4 shadow-lg">
                    <TreePine size={40} />
                </div>
                <h1 className="text-3xl font-bold text-emerald-900">EcoGuard</h1>
                <p className="text-emerald-600 font-medium">Système de Surveillance Forestière</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-emerald-100">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                {isLogin ? <LogIn size={24} /> : <UserPlus size={24} />}
                {isLogin ? 'Connexion' : 'Inscription'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom Complet</label>
                    <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-400">
                            <Mail size={18} />
                        </span>
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                            placeholder="Ex: koko.popom@gmaknom.cm"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </div>
                </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-400">
                            <Mail size={18} />
                        </span>
                        <input
                            type="text"
                            name='email'
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                            placeholder="Ex: garde_douala"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                    <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400">
                        <Lock size={18} />
                    </span>
                    <input
                        name='password'
                        type="password"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                    />
                    </div>
                </div>

          {!isLogin && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fonction</label>
                    <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-400">
                            <ShieldCheck size={18} />
                        </span>
                        <select
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                        >
                            <option value="GARDE">Garde Forestier</option>
                            <option value="ADMIN">Administrateur</option>
                        </select>
                    </div>
                </div>
          )}

                <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md flex justify-center items-center gap-2"
                >
                    {isLogin ? 'Se connecter' : "Créer mon compte"}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-600 text-sm mb-4">
                {isLogin ? "Vous n'avez pas de compte ?" : "Vous avez déjà un compte ?"}
            </p>
            <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors"
            >
                {isLogin ? "Créer un compte de garde" : "Retourner à la connexion"}
            </button>
            </div>
        </div>
        <p className="mt-8 text-emerald-800/50 text-xs text-center max-w-xs">
            En cas de perte de connexion, vos identifiants cryptés resteront accessibles localement.
        </p>
    </div>
  );
};

export default LoginPage;
