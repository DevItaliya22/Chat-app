import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function Login() {
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login, check, isLoggedIn } = useAuth();



    return (
        <>
            {isLoggedIn ? navigate("/") :
                <div className='Login-Page' style={{fontFamily:'sans-serif' , display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#202c33' }}>
                    <div className="main-login" style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '10px', backgroundColor: '#fff', boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)' }}>
                        <div className="heading-login" style={{ marginBottom: '20px', textAlign: 'center' }}>
                            <h2>Sign in to Chat App</h2>
                        </div>
                        <div className='Input-login'>
                            <input type="text" placeholder="Email" style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                            <input type="password" placeholder="Password" style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                            <button style={{ width: '100%', padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#007bff', color: '#fff' }}>Submit</button>
                        </div>
                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            Don't have an account? <Link to="/signup" style={{ color: '#007bff', textDecoration: 'none' }}>Sign Up</Link>
                        </div>
                    </div>
                </div>
            }
        </>
    );
}

export default Login;
