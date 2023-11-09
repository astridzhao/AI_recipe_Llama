// https://github.com/chaoocharles/sppms/blob/master/project-progress/src/App.js

import logo from "./logo.svg";
import React, { useState,Component } from 'react';
// import { BrowserRouter, Switch, Route } from "react-router-dom";
import "./App.css";

function App() {
  const [formValues, setFormValues]  = useState({
    input: "Tomato, Egg, Cheese, Turkey",
    cuisine: "Asian",
  });
  const [recipeResponse, setRecipeResponse] = useState(null);
  const [error, setError] = useState(null);

  const change = event =>{
    const {name, value} = event.target
    setFormValues(prevValues => ({
      ...prevValues, // Spread the previous values to retain them
      [name]: value  // Update only the input field with the new value
    }));
  }
  //   const {name_cuisine, value_cuisine} = event.target
  //   setFormValues(prevValues => ({
  //     ...prevValues, // Spread the previous values to retain them
  //     [name_cuisine]: value_cuisine  // Update only the input field with the new value
  //   }));
  // }


  function GenerationClick() {
    let data = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({'ingredient': formValues.input}),
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

  function EmptyClick() {

  }

 return (
      <div className="App">
        <header className="App-header">
          <div className="input-box">
            <p>
              Enter your recipe ingredients below!
            </p>
            <input 
              className="ingredient-box"
              name="input" // Correct attribute name is "name"
              value={formValues.input} // Correct attribute name is "value"
              onChange={change} 
              type="text" 
              required 
            />
            <input 
              className="cuisine-box"
              name="cuisine" // Correct attribute name is "name"
              value={formValues.cuisine} // Correct attribute name is "value"
              onChange={change} 
              type="text"
            />

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

          <div className="empty-output">
            <button 
                  className = "empty-button" 
                  onClick={EmptyClick}>Empty Generation
              </button>
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
