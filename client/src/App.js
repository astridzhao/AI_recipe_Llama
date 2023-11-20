// https://github.com/chaoocharles/sppms/blob/master/project-progress/src/App.js
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Homes';
import Reports from './pages/Reports';
import Products from './pages/Products';
import "./App.css";
import { ChakraProvider } from "@chakra-ui/react"
import TextField from "@mui/material/TextField"
import Button from '@mui/material/Button';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Select, {SelectChangeEvent} from '@mui/material/Select';
// import Switch from '@mui/material/Switch';
// import Switch from 'react-switch'
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import copy from "copy-to-clipboard";


function App() {
  const [formValues, setFormValues]  = useState({
    ingredient: "Tomato, Egg, Cheese",
    cuisine_style: "Chinese",
    serving_size: "2",
  });
  const [recipeResponse, setRecipeResponse] = useState(null);
  const [error, setError] = useState(null);
  const [selectedRestriction, setSelectedRestriction] = useState("No Restriction")

  const copyToClipboard = () => {
      copy(recipeResponse);
      alert(`You have copied the recipe.`);
  };

  const handleChange_values = event1 =>{
    const {name, value} = event1.target
    setFormValues(prevValues => ({
      ...prevValues, // Spread the previous values to retain them
      [name]: value  // Update only the input field with the new value
    }));
  }
  
  const handleChange_dietary = (event3) => {
    setSelectedRestriction(event3.target.value); // onChange handler
  }
  // const onCopy = () => {
  //   setIsCopied(true);
  //   setTimeout(() => setIsCopied(false), 1500); // Reset the copied status after 1.5 seconds
  // };

  function GenerationClick() {
    let data = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({'ingredient': formValues.ingredient, 
                            'cuisine_style': formValues.cuisine_style, 
                            'serving_size': formValues.serving_size,
                            'dietary_restriction': selectedRestriction}),
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

        <Alert severity="info">The estimated waiting time is 40s.</Alert>
        <Alert severity="warning">Please empty the generation before start a new generation.</Alert>

        <div className="App-header">
          
          <div className="input-box">
          <Grid container spacing={2}>
            <Grid item xs={12} >
              <TextField fullWidth label="Ingredients" variant="outlined" 
                className="ingredient-box"
                name="ingredient" // Correct attribute name is "name"
                value={formValues.ingredient} // Correct attribute name is "value"
                onChange={handleChange_values} 
                type="text" 
                required />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth id="Required-basic" label="Serving Size" variant="outlined" 
                  className="serving-box"
                  name="serving_size" // Correct attribute name is "name"
                  value={formValues.serving_size} // Correct attribute name is "value"
                  onChange={handleChange_values} 
                  type = "number"
                  required/>
            </Grid>
            <Grid item xs={4} >
              <TextField  fullWidth
                  id="Required-basic" label="Cuisine" variant="outlined" 
                  className="cuisine-box"
                  name="cuisine_style" 
                  value={formValues.cuisine_style} 
                  onChange={handleChange_values} 
                  type="text"
                  required/>
            </Grid>
            
            <Grid item xs={4}>
              <section className="dietaryRestriction" style={{textAlign: "left", font: "Times New Roman"}}>
                  <FormControl fullWidth sx={{minWidth: 200 }} >
                  <InputLabel id="Required-basic" >Restriction</InputLabel>
                      < Select 
                        value={selectedRestriction}  
                        label="Required" 
                        labelId="Required-basic"
                        id = "Required-basic"
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

        
          <div className="button">
          <Button className='button-submit'  onClick={GenerationClick}>Recipe start</Button>
          <Button className = "empty-button" onClick={EmptyClick}>Empty Generation </Button>
          <Button className='copy-button' onClick={copyToClipboard}>Copy to Clipboard</Button>
          </div>

          <div className="recipe-generation-output"  style={{ display: "inline-block" , width: "1200px",
                height: "490px", padding: "20px", color:"black",  backgroundColor: "rgb(243, 250, 224)", 
                borderBlock: "solid", borderBlockColor: "white", writingMode: "horizontal-tb",
                }}> {recipeResponse }{error} 
          </div>

      </div>
      </div>
    );
}
export default App;


// <div className="recipeLength">
// <FormControl component="fieldset">
//   <FormControlLabel
//     value="Easy recipe"
//     control={
//       <Switch
//         checked={checked}
//         inputProps={{ 'aria-label': 'Switch' }}
//         onChange={handleChange_recipelength}
//       />
//     }
//     label="Easy recipe"
//     labelPlacement="top"
//   />
// </FormControl></div>