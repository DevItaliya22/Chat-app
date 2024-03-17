import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Signup() {
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

 

    return (
        <div className='Signup-Page' style={{fontFamily:'sans-serif' ,display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#202c33' }}>
            <div className="main-signup" style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '10px', backgroundColor: '#fff', boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)' }}>
                <div className="heading-signup" style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <h2>Create an Account</h2>
                </div>
                <div className='Input-signup'>
                    <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                    <button  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#007bff', color: '#fff' }}>Sign Up</button>
                </div>
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    Already have an account? <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>Login</Link>
                </div>
            </div>
        </div>
    );
}

export default Signup;
