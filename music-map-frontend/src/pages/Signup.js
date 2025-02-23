import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/users/register`, formData);
      navigate('/login'); // Vai al login dopo la registrazione
    } catch (err) {
      console.error(err);
      alert('Errore nella registrazione');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleSubmit} className="w-1/3 bg-gray-100 p-8 rounded shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Registrati</h2>
        <input
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
          className="w-full p-2 mb-4 border"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full p-2 mb-4 border"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full p-2 mb-4 border"
          required
        />
        <button type="submit" className="w-full bg-green-500 text-white py-2 rounded">
          Registrati
        </button>
      </form>
    </div>
  );
};

export default Signup;
 
