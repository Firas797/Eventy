import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../Redux/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import './LoginRegister.css';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });

  const [passwordMatch, setPasswordMatch] = useState(true);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Check password match in real-time
    if (name === 'passwordConfirm') {
      setPasswordMatch(value === formData.password);
    } else if (name === 'password') {
      setPasswordMatch(formData.passwordConfirm === value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.passwordConfirm) {
      setPasswordMatch(false);
      return;
    }
    
    dispatch(registerUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
        passwordConfirm: formData.passwordConfirm, // ✅ Include this!

    }));
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Register</h2>
      {error && (
        <div className="alert alert-danger text-center">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            Name
          </label>
          <input
            type="text"
            name="name"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            required
            minLength="2"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="passwordConfirm" className="form-label">
            Confirm Password
          </label>
          <input
            type="password"
            name="passwordConfirm"
            className={`form-control ${!passwordMatch ? 'is-invalid' : ''}`}
            value={formData.passwordConfirm}
            onChange={handleChange}
            required
            minLength="6"
          />
          {!passwordMatch && (
            <div className="invalid-feedback">Passwords do not match</div>
          )}
        </div>
        <div className="d-grid gap-2">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !passwordMatch}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Registering...
              </>
            ) : (
              'Register'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;