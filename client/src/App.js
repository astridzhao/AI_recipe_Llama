// https://github.com/chaoocharles/sppms/blob/master/project-progress/src/App.js
import React, { useState , useEffect} from 'react';
// import { Router, Routes, Route, Link } from 'react-router-dom';
// import Home from './pages/Homes';
// import Shoppinglists from './pages/Shoppinglists';
// import Recipes from './pages/Recipes';
import ResponsiveAppbar from './Appbar';
import "./App.css";
import color from "@mui/material/colors"
// import TextField from "@mui/material/TextField"
import Button from '@mui/material/Button';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import copy from "copy-to-clipboard";
import Box from '@mui/material/Box';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Typography, TextField,Container, Paper } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';

function App() {
  const [formValues, setFormValues]  = useState({
    cuisine_style: "Asian",
    serving_size: "2",
  });

  const [inputIngredient, setInputIngredient] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipeResponse, setRecipeResponse] = useState("");
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(null); // Add a state for tracking request ID
  const [selectedRestriction, setSelectedRestriction] = useState("No Restriction");
  const [selectedDish, setSelectedDish] = useState("No Preference");
  const [selectedCookingMethod, setSelectedCookingMethod] = useState("No Preference");

  const ingredientList = ['Tomato', 'Onion', 'Pepper', 'Spinach', 'Lettuce', 'Kale', 'Eggplant', 'Carrot', 'Brocolli', 'Califlower', 
  'Cheese', 'Egg', 'Chicken Breast', 'Ground Turkey', 'Short Ribs', 'Beef', 'Salmon', 'Shrimp', 'Pork', 'Sweet Potato', 'Potato', 'Rice', 'Pasta', 'Bread', 'Rolled oats', 'Cilantro', 'Garlic', 'Ginger', 'Basil', 'Butter', 'Olive Oil'];
  const addIngredient = ingredient => {
    setInputIngredient(prev => {
      // Split current ingredients into an array
      const currentIngredients = prev.split(', ').filter(Boolean);
      if (currentIngredients.includes(ingredient)) {
        // Remove the ingredient by creating a new array 
        return currentIngredients.filter(item => item !== ingredient).join(', ');
      } else {
        // the spread operator (...) is used to create a new array that contains all the elements of currentIngredients, plus the new ingredient at the end.
        return [...currentIngredients, ingredient].join(', ');
      }
    });
  };

  const handleChange_values = event1 =>{
    const {name, value} = event1.target
    setFormValues(prevValues => ({
      ...prevValues, // Spread the previous values to retain them
      [name]: value  // Update only the input field with the new value
    }));
  }

  const handleChange_ingredient = (event2) => {
    setInputIngredient(event2.target.value);
  };
  
  const handleChange_dietary = (event3) => {
    setSelectedRestriction(event3.target.value); // onChange handler
  }

  const handleChange_dish= (event4) => {
    setSelectedDish(event4.target.value); // onChange handler
  }

  const handleChange_cookingmethod = (event5) => {
    setSelectedCookingMethod(event5.target.value); // onChange handler
  }

  const iconStyle = {
      margin: '0 15px', // Adds space around the icon
      color: 'inherit',    // Sets the icon color
  };
  
  function stripHtml(html) {
    // Create a new div element
    var temporalDivElement = document.createElement("div");
    // Set the HTML content with the given value
    temporalDivElement.innerHTML = html;
    // Retrieve the text property of the element
    return temporalDivElement.textContent || temporalDivElement.innerText || "";
  }
  
  const copyToClipboard = () => {
    // This will copy the plain text, without any HTML, to the clipboard
    copy(stripHtml(recipeResponse));
    alert(`You have copied the recipe.`);
  };
 

  function formatResponse(response) {
    // Add bold to headers
    response = response.replace(/(Title:)/gi, "<strong>$1</strong>")
                    .replace(/(Ingredient List:)/gi, "<strong>$1</strong>")
                    .replace(/(Step-by-Step Instructions:)/gi, "<strong>$1</strong>")
                    .replace(/(Expected Cooking Time:)/gi, "<strong>$1</strong>")
                    .replace(/(Note:)/gi, "<strong>$1</strong>");;
    // Replace asterisks with list items for ingredients
    response = response.replace(/\* (.*?)\n/gi, "<li>$1</li>");
    return response
  }


  function GenerationClick() {
    console.log("after GenerationClick loading = ", loading);
    let data = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({'ingredient': inputIngredient,
                            'cuisine_style': formValues.cuisine_style, 
                            'serving_size': formValues.serving_size,
                            'dietary_restriction': selectedRestriction,
                            'typedish':selectedDish,
                            'cooking_method': selectedCookingMethod}),
    };

    setLoading(true)


    fetch("http://127.0.0.1:5000/recipes/recipe", data)
    .then((response) => { //handle the initial Response object 
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => { //used to handle the resolution of the Promise returned by the .json() method.
      setRequestId(data.llm_output);
      console.log(data);
      setLoading(false);
    })
    .catch((error) => {
      setError(error);
      setLoading(false);
      console.error('There has been a problem with your fetch operation:', error);
    });

  }

  useEffect(() => {
    console.log("after get ID, loading = ", loading);
    console.log("start generating recipe with ", requestId);
    if (!requestId){
      console.error("no request ID");
      return;
    }; // Do nothing if no request ID
    setLoading(true);
    const interval = setInterval(() => { //to create a repeating interval that executes a function at a specified time interval
    fetch(`http://127.0.0.1:5000/recipes/recipe/${requestId}`)
        .then(response => response.json())
        .then(data => {
          if (data.llm_output) {
          // Check if the recipe generation is complete
            if (data.llm_output === "Recipe completed.") {
              console.log("Recipe completed.")
              clearInterval(interval);
              setLoading(false);
              
            }
            else{
              console.log("set value.", data.llm_output);
              setRecipeResponse(prev => formatResponse(prev + data.llm_output)); // Append new output
            }
          }
          else {
            clearInterval(interval);
            setLoading(false);
          }
        })
        .catch(error => {
          clearInterval(interval); // Clear the interval on error
          setLoading(false);
          setError(error);
          console.error('Error:', error);
        });
    }, 1000); // Poll every 1 seconds
    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, [requestId]); // Dependency array includes requestId

  function EmptyClick() {
    setLoading(false);
    setRecipeResponse("");
    setRequestId(null);
    setError(null);
    console.log("start generating recipe", requestId);
  }

return (

  
      <div className="App">

        <div><ResponsiveAppbar/></div>
      
        <Alert severity="info">The estimated waiting time is about 20s. </Alert>
        <Alert severity="warning"> Please empty the last generation before start the new generation.</Alert>
        
        <div className="App-layout">
        <Container>
          
            <Typography variant="h4" fontWeight= 'medium' fontFamily='Arial' gutterBottom = 'true'>
              Meet Your Personal AI-Powered Life Assistant
            </Typography>
            <Typography variant="body1" gutterBottom>
              Simply choose or type some ingredients you have on hand and AI Recipe will generate a personalized recipe just for you!
            </Typography>
            <Typography variant="body2" gutterBottom>
            You can add ingredients by clicking the ingredients buttons and remove ingredients by clicking again. You can also input any ingredients by typing.

            To get a more customized recipe, you can choose serving size, cuisine style, dish type, cooking method, and dietary restriction.

            In the end, click " GENERATE RECIPE" button to start!
            </Typography>

            
        </Container>
        <div className="input-box">
          <Grid container direction="row" justifyContent="center" alignItems="center" rowSpacing={5} columnSpacing={{ xs: 1}}>

            <Grid item xs={12} margin={2}>
                <TextField fullWidth id="outlined-ingredient" label="Enter your ingredients" variant="outlined" 
                className="ingredient-box"
                name="ingredient" // Correct attribute name is "name"
                type="text" 
                value={inputIngredient} 
                onChange = {handleChange_ingredient}
                required /> 
            </Grid>

            <Box sx={{ '& button': { m: 1 } }}>
              <div>
                {ingredientList.map(ingredient => (
                  <Button variant="contained" size="small" 
                    style={{ backgroundColor:'antiquewhite', color: 'black' }}
                    key={ingredient}  onClick={() => addIngredient(ingredient)}>
                    {ingredient} 
                  </Button>
                ))}
              </div>
            </Box>

            <Grid item xs={1.5}>
              <TextField fullWidth
                  id="outlined-servingsize" label="Serving Size" variant="outlined" 
                  className="serving-box"
                  name="serving_size" // Correct attribute name is "name"
                  value={formValues.serving_size} // Correct attribute name is "value"
                  onChange={handleChange_values} 
                  type = "number"
                  required/>
            </Grid>

            <Grid item xs={2} >
              <TextField fullWidth
                  id="outlined-Cuisine" label="Cuisine Style" variant="outlined" 
                  className="cuisine-box"
                  name="cuisine_style" 
                  value={formValues.cuisine_style} 
                  onChange={handleChange_values} 
                  type="text"
                  required/>
            </Grid>

            <Grid item xs={2}>
              <section className="typedish" style={{textAlign: "left"}}>
                    <FormControl fullWidth>
                    <InputLabel id="outlined-typedish" variant='outlined' required size="normal" >Dish Type</InputLabel>
                        < Select 
                          value={selectedDish}  
                          label="outlined-typedish"
                          name = "typedish"
                          onChange={handleChange_dish} required> {/* Select component with value and onChange */}
                          <MenuItem value={"No Preference"}>No Preference</MenuItem> 
                          <MenuItem value={"One-pot Meal"}>One-pot Meal</MenuItem>
                          <MenuItem value={"Breakfast"}>Breakfast</MenuItem> 
                          <MenuItem value={"Lunch"}>Lunch</MenuItem>
                          <MenuItem value={"Dinner"}>Dinner</MenuItem>
                          <MenuItem value={"Brunch"}>Brunch</MenuItem>
                          <MenuItem value={"Salad"}>Salad</MenuItem>
                          <MenuItem value={"Quick Meal"}>Quick Meal</MenuItem>
                          <MenuItem value={"Dessert"}>Dessert</MenuItem>
                        </Select>
                    </FormControl> 
                  </section>
            </Grid>

            <Grid item xs={3}>
              <section className="cooking_method" style={{textAlign: "left"}}>
                    <FormControl fullWidth>
                    <InputLabel id="outlined-cooking_method" variant='outlined' required size="normal" >Cooking Method</InputLabel>
                        < Select 
                          value={selectedCookingMethod}  
                          label="outlined-cooking_method"
                          name = "cooking_method"
                          onChange={handleChange_cookingmethod} required> {/* Select component with value and onChange */}
                          <MenuItem value={"No Preference"}>No Preference</MenuItem>
                          
                          <MenuItem value={"Air Fryer"}>Air Fryer</MenuItem> 
                          <MenuItem value={"Stir Fry"}>Stir Fry</MenuItem>
                          <MenuItem value={"Pan Fry"}>Pan Fry</MenuItem>
                          <MenuItem value={"Oven Bake"}>Oven Bake</MenuItem>
                          <MenuItem value={"Grill"}>Grill</MenuItem>
                          <MenuItem value={"Steam"}>Steam</MenuItem>
                          <MenuItem value={"Stew"}>Stew</MenuItem>
                        </Select>
                    </FormControl> 
                  </section>
            </Grid>


            <Grid item xs={3}>
              <section className="dietaryRestriction" style={{textAlign: "left"}}>
                  <FormControl fullWidth >
                  <InputLabel id="outlined-dietaryRestriction" variant='outlined' required size="normal" >Dietary Restriction</InputLabel>
                      < Select 
                        value={selectedRestriction}  
                        label="outlined-dietaryRestriction"
                        name = "dietary_restriction"
                        onChange={handleChange_dietary} required> {/* Select component with value and onChange */}
                        <MenuItem value={"No Restriction"}>No Restriction</MenuItem> 
                        <MenuItem value={"Gluten-Free"}>Gluten-Free</MenuItem> 
                        <MenuItem value={"Vegetarian"}>Vegetarian</MenuItem>
                        <MenuItem value={"Pescatarian"}>Pescatarian</MenuItem>
                        <MenuItem value={"Vegan"}>Vegan</MenuItem>
                        <MenuItem value={"Lactose Intolerance"}>Lactose Intolerance</MenuItem>
                        <MenuItem value={"Shellfish Allergies"}>Shellfish Allergies</MenuItem>
                        <MenuItem value={"Nut Allergies"}>Nut Allergies</MenuItem>
                        <MenuItem value={"Low-Carb/Keto"}>Low-Carb/Keto</MenuItem>
                      </Select>
                  </FormControl> 
                </section>
              </Grid>
            </Grid>
          </div>

        
          <div className="button" >

          <Grid container marginTop={0.5} direction="row" justifyContent="center" alignItems="center" columnSpacing={1} rowSpacing={4} >

            <Grid item xs={4} md={6}>

                <Button  onClick={GenerationClick} variant="contained" color="primary" >Generate Recipe</Button>
            </Grid>

            <Grid item xs={4} md={6}>
                <Button  onClick={EmptyClick}variant="contained" color="primary" >Empty Generation </Button>

            </Grid>

            <Grid item xs={12} >
                <ContentCopyIcon style = {iconStyle} onClick={copyToClipboard}></ContentCopyIcon>
                <FavoriteIcon style = {iconStyle}></FavoriteIcon>
                <ShareIcon style = {iconStyle}></ShareIcon>
            </Grid>

          </Grid>

          </div>

          

          <div className="recipe-generation-output"  
                style={{ display: "inline-block" , width: "1000px",
                height: "1000px", padding: "20px", marginBlock: "10px", lineHeight: '2', color:"black",  backgroundColor: "rgb(243, 250, 224)", 
                borderBlock: "solid", borderBlockColor: "white", writingMode: "horizontal-tb",
                }}>

                <div dangerouslySetInnerHTML={{ __html: recipeResponse }} /></div>

          </div>
      </div>
    );
}
export default App;