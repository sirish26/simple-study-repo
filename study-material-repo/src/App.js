import React, { useState, useEffect } from 'react';
import './App.css';

const SERVER_URL = 'http://localhost:3001'; 

const App = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [format, setFormat] = useState('');
  const [file, setFile] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMaterials = () => {
    let url = `${SERVER_URL}/materials`;
    if (searchQuery) {
      url += `?search=${encodeURIComponent(searchQuery)}`;
    }

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setMaterials(data);
        console.log(materials)
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  useEffect(() => {
    fetchMaterials();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  function handleFileChange(e) {
    setFile(e.target.files[0]);
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('format', format);
    formData.append('file', file);

    try {
      const response = await fetch(`${SERVER_URL}/materials`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setTitle('');
        setCategory('');
        setFormat('');
        setFile(null);
        fetchMaterials();
      } else {
        console.error('Error:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
 

  return (
    <div className="container">
      <h1>Study Material Repository</h1>

      <form onSubmit={handleFormSubmit} encType="multipart/form-data">
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label htmlFor="category">Category:</label>
        <input
          type="text"
          id="category"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />

        <label htmlFor="format">Format:</label>
        <select
          id="format"
          name="format"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          required
        >
          <option value="">Select Format</option>
          <option value="pdf">PDF</option>
          <option value="word">Word</option>
          <option value="image">Image</option>
          <option value="link">Link</option>
        </select>

        {format !== 'link' && (
          <div>
            <label htmlFor="file">File:</label>
            <input
              type="file"
              id="file"
              name="file"
              onChange={handleFileChange}
              required={format !== ''}
            />
          </div>
        )}

        <button type='submit'>Submit</button>
      </form>

      <div>
        <input
          type="text"
          id="searchInput"
          placeholder="Search by Title or Category"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={() => setSearchQuery('')}>Reset</button>
      </div>

      <div id="materialsList">
        {materials.map((material) => (
          <div key={material._id} className="material">
            <h3>{material.title}</h3>
            <p>Category: {material.category}</p>
            <p>Format: {material.format}</p>
            {material.format === 'link' ? (
              <a href={material.file} target="_blank" rel="noopener noreferrer">
                View Link
              </a>
            ) : (
              <a href={`${SERVER_URL}/download/${material.file}`} download>
                Download
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
