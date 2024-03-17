import React from 'react'
import Chats from './component/Chats'
import SignUp from './component/SignUp';
import Login from './component/Login';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Chats />} />
          <Route path="/login" element={<Login/>}></Route>
          <Route path="/SignUp" element={<SignUp/>}></Route>
        </Routes>
      </Router>
    </div>
  )
}

export default App
