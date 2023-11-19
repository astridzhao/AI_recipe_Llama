// https://github.com/chaoocharles/sppms/blob/master/project-progress/src/App.js
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Switch, Routes, Route } from 'react-router-dom';
import ReactSwitch from 'react-switch';
import Home from './pages/Homes';
import Reports from './pages/Reports';
import Products from './pages/Products';
import "./App.css";
import { ChakraProvider } from "@chakra-ui/react"
import { Button } from "@chakra-ui/react"


function App() {
  const [formValues, setFormValues]  = useState({
    ingredient: "Tomato, Egg, Cheese, Turkey",
    cuisine_style: "Asian",
    serving_size: "2",
  });
  const [recipeResponse, setRecipeResponse] = useState(null);
  const [error, setError] = useState(null);
  const [checked, setChecked] = useState(true);
  const [selectedRestriction, setSelectedRestriction] = useState("No Restriction")
  const handleChange_recipelength = val => {
    setChecked(val);
  }
  const handleChange_dietary = (event) => {
    setSelectedRestriction(event.target.value); // onChange handler
};
  const change = event =>{
    const {name, value} = event.target
    setFormValues(prevValues => ({
      ...prevValues, // Spread the previous values to retain them
      [name]: value  // Update only the input field with the new value
    }));
  }

  function GenerationClick() {
    let data = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({'ingredient': formValues.ingredient, 
                            'cuisine_style': formValues.cuisine_style, 
                            'serving_size': formValues.serving_size,
                            'dietary_restriction': selectedRestriction,
                            'easy_recipe': checked}),
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
      setRecipeResponse(llmOutput, ); // Set the response data to the state
      console.log(llmOutput);
    })
    .catch((error) => {
      setError(error);
      console.error('There has been a problem with your fetch operation:', error);
    });
  }

  function EmptyClick() {
    setRecipeResponse(" ");
    setError(" ")
  }

 return (
      <div className="App">
        <>
          <Router>
            <Navbar />
            <Routes>
              <Route path='/' exact component={Home} />
              <Route path='/reports' component={Reports} />
              <Route path='/products' component={Products} />
            </Routes>
          </Router>
        </>

        <div className="App-header">
        <p>Enter your recipe ingredients, cuisine style, and serving size! The estimated waiting time is 40s.</p>
          <div className="input-box">
              <input className="ingredient-box"
                name="ingredient" // Correct attribute name is "name"
                value={formValues.ingredient} // Correct attribute name is "value"
                onChange={change} 
                type="text" 
                required />
              <input className="cuisine-box"
                name="cuisine_style" // Correct attribute name is "name"
                value={formValues.cuisine_style} // Correct attribute name is "value"
                onChange={change} 
                type="text"
                required/>
              <input className="serving-box"
                name="serving_size" // Correct attribute name is "name"
                value={formValues.serving_size} // Correct attribute name is "value"
                onChange={change} 
                type = "number"
                required/>
              <div className="recipeLength" style={{textAlign: "center"}}>
                    <p style={{ marginRight: "10px" }}>Easy Recipe</p>
                    <ReactSwitch
                      checked={checked}
                      onChange={handleChange_recipelength}
                      required
                    />
              </div>
              <div className="dietaryRestriction" style={{textAlign: "center", font: "Times New Roman"}}>
                    <p style={{ marginRight: "10px" }}>Dietary Restriction</p>
                    <select value={selectedRestriction}  onChange={handleChange_dietary}> {/* Select component with value and onChange */}
                      <option value="No Restriction">No Restriction</option> 
                      <option value="Gluten-Free">Gluten-Free</option> 
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Pescatarian">Pescatarian</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Lactose Intolerance">Lactose Intolerance</option>
                      <option value="Shellfish Allergies">Shellfish Allergies</option>
                      <option value="Nut Allergies">Nut Allergies</option>
                      <option value="Low-Carb/Keto">Low-Carb/Keto</option>
                      
                  </select>
              </div>

          </div>

          <div className="button">
          <Button className='button-submit'  onClick={GenerationClick}>Recipe start</Button>
          <Button className = "empty-button" onClick={EmptyClick}>Empty Generation </Button>
          </div>

         <div className="recipe-generation-output"  style={{ display: "inline-block" , width: "1200px",
                height: "380px", color:"white",  borderBlock: "solid", borderBlockColor: "white", writingMode: "horizontal-tb"
                }}> {recipeResponse }{error}  
                
          </div>

      </div>
      </div>
    );
}
export default App;
