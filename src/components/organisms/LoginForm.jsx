import React, { useState } from 'react';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { Button, Input, Avatar } from '../atoms';

/**
 * LoginForm component - User authentication form
 * @param {Object} props - Component props
 * @param {Function} props.onLogin - Login callback function
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 * @param {string} props.className - Additional CSS classes
 */
const LoginForm = ({
  onLogin,
  loading = false,
  error = '',
  className = '',
  ...props
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onLogin({ email, password });
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (validationErrors.email) {
      setValidationErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (validationErrors.password) {
      setValidationErrors(prev => ({ ...prev, password: '' }));
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`} {...props}>
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Avatar size="xl" className="bg-primary-100">
            <LogIn className="w-8 h-8 text-primary-600" />
          </Avatar>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Sign in to DXRB
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter your credentials to access the field uploader
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={handleEmailChange}
          error={validationErrors.email}
          required
          disabled={loading}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={handlePasswordChange}
            error={validationErrors.password}
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          disabled={loading}
          className="w-full"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Contact your administrator if you need help with your account
        </p>
      </div>
    </div>
  );
};

export default LoginForm;