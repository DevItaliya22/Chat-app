import React, { useState,useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from "../context/AuthContext";

function Signup() {
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { isLoggedIn, check } = useAuth();

    const handleSubmit = async () => {
        try {
            const response = await axios.post("http://localhost:3000/signup", {
                email: email,
                password: password
            });

            let data = response.data;

            if (data.message === "User already exists") {
                setError("User already exists");
            } else if (data.message === "Invalid input from user") {
                setError("Invalid input from user");
            } else {
                localStorage.setItem("token", data.token);
                navigate("/");
            }
        } catch (error) {
            console.error("Error during signup:", error);
            setError('Error during signup. Please try again.');
        }
    }
    useEffect(() => {
        check();
      }, []);
    
    useEffect(() => {
        if (isLoggedIn) {
            navigate("/");
        }
    }, [isLoggedIn, navigate]);


    return (
        <div className='Signup-Page' style={{ fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#202c33' }}>
            <div className="main-signup" style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '10px', backgroundColor: '#fff', boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)' }}>
                <div className="heading-signup" style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <h2>Create an Account</h2>
                </div>
                <div className='Input-signup'>
                    <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                    <button style={{ width: '100%', padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#007bff', color: '#fff' }} onClick={handleSubmit}>Sign Up</button>
                </div>
                <h4 style={{ textAlign: "center", fontFamily: "sans-serif", color: "red", paddingTop: "20px" }}>{error}</h4>
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    Already have an account? <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>Login</Link>
                </div>
            </div>
        </div>
    );
}

export default Signup;
