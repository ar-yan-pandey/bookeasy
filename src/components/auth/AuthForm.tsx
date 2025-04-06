import React, { useState } from 'react';
import { supabase } from '../../config/supabase';
import { UserType } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/auth.scss';

const AuthForm: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<UserType>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Admin check takes precedence, otherwise use selected type
      const finalUserType: UserType = email === 'admin@gmail.com' ? 'admin' : userType;

      if (!isLogin) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              user_type: finalUserType,
              name
            }
          }
        });
        if (error) throw error;
        setError('Please check your email for verification link');
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Get user metadata
        const { data: { user } } = await supabase.auth.getUser();
        const userType = user?.user_metadata?.user_type as UserType;
        
        // Navigate based on user type
        switch (userType || (email === 'admin@gmail.com' ? 'admin' : 'user')) {
          case 'admin':
            navigate('/admin');
            break;
          case 'provider':
            navigate('/business');
            break;
          default:
            navigate('/services');
        }
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
        
        <div className="user-type-toggle">
          <button
            className={`toggle-btn ${userType === 'user' ? 'active' : ''}`}
            onClick={() => setUserType('user')}
          >
            User
          </button>
          <button
            className={`toggle-btn ${userType === 'provider' ? 'active' : ''}`}
            onClick={() => setUserType('provider')}
          >
            Service Provider
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              className="form-control"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            className="switch-btn"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
