// https://github.com/chaoocharles/sppms/blob/master/project-progress/src/App.js

import logo from "./logo.svg";
import React, { useState,Component } from 'react';
// import { BrowserRouter, Switch, Route } from "react-router-dom";
import "./App.css";

function App() {
  const [input, setInput] = useState("Tomato, Egg, Cheese, Turkey");
  const [recipeResponse, setRecipeResponse] = useState(null);
  const [error, setError] = useState(null);

  const change = event =>{
    const newValue = event.target.value
    setInput(newValue)
  }

  function GenerationClick() {
    let data = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 'ingredient': input}),
    };

    //outputs a message to the web console
    console.log('Making fetch call with data:', data.body);
    
    fetch("http://127.0.0.1:5000/recipes/recipe", data)
    .then((response) => { //handle the initial Response object 
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => { //used to handle the resolution of the Promise returned by the .json() method.
      const llmOutput = data.llm_output;
     
      setRecipeResponse(llmOutput); // Set the response data to the state
      console.log(llmOutput);
    })
    .catch((error) => {
      setError(error);
      console.error('There has been a problem with your fetch operation:', error);
    });
  }
 return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />

          <div className="Recipe Generation Input">
            <p>
              Enter your recipe ingredients below!
            </p>
            <input 
                className = "input-box"
                onChange = {change} 
                value = {input} 
                type = "text" 
                required />
            <button 
                className = "submit-button" 
                onClick={GenerationClick}>Recipe start
            </button>
            
          </div>

          <div className="recipe-generation-input">
              {recipeResponse}
              {/* {<div>{JSON.stringify(recipeResponse)}</div>} */}
              {error && <div>Error: {error.message}</div>}
  
          </div>

          <a
            className="App-link"
            href="https://www.allrecipes.com/recipes/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Know more recipe!
          </a>
        </header>
      </div>
    );
}
export default App;
