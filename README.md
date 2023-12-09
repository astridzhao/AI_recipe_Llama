# AI Recipe Chatbot
## Table of Contents
- [About The Project](#about-the-project)
  - [What this App can do?](#what-this-app-can-do)
  - [Built With](#built-with)
- [Proposal](#proposal)
  - [Problem Observation](#problem-observation)
  - [Learning Goal](#learning-goal)
- [Getting Started](#getting-started)
  - [Prerequisite](#prerequisite)
  - [Installation](#installation)
- [Usage](#usage)
  - [Initiate Program](#initiate-program)
  - [Program Function](#program-function)
- [Contributing](#contributing)
- [Contact](#contact)
- [Acknowledgments](#acknowledgments)

<!-- ABOUT THE PROJECT -->
## About the Project
Keywords: LLMs, Software Design, Beginners Friendly, Environment Friendly

### What this App can do?
* Help people who are new to cooking can have more tasty and healthy food at home and save money on food.
* Make an echo-friendly decision for grocery shopping and ingredient choosing.
* Generate a personalized and unique recipe, “Everyone can be a chief”!

### Built With
* ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=blue)
* ![Llama.cpp](https://img.shields.io/badge/Llama.cpp-002b36?style=for-the-badge)
* ![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
* ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
* ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
* ![CSS](https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css3&logoColor=orange)
* ![HTML](https://img.shields.io/badge/HTML-E34F26?style=for-the-badge&logo=html5&logoColor=white)
* ![JSON](https://img.shields.io/badge/JSON-000000?style=for-the-badge&logo=json&logoColor=green)
  
<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- PROPOSAL -->
## Proposal

### Problem Observation

* **Choosing the Right Recipe**:
  * **Skill Level Barrier**: Many young individuals face difficulty in selecting recipes that align with their cooking skills, often leading to frustration and disinterest.
  * **Time Constraints**: With busy schedules, finding recipes that are quick and easy to prepare remains a significant challenge.
  * **Dietary Balance**: People aiming for a balanced diet often struggle to find varied recipes that utilize the same set of ingredients, hindering their ability to maintain a consistent, healthy diet.
    
* **Food Waste**: Inexperienced cooks frequently encounter the issue of food waste, primarily due to a lack of knowledge in effectively pairing and utilizing various ingredients.

* **Accessibility of Online Resources**:
  * **Dietary and Cuisine Limitations**: Online recipe resources often fall short in catering to specific dietary needs (like vegan, vegetarian, gluten-free options) and diverse cuisine preferences. This limitation becomes particularly evident during home-hosted dinner parties.

* **Grocery Shopping Challenges**:
  * **Purchasing Decisions**: Novice cooks can find grocery shopping daunting, especially when it comes to selecting the right ingredients in appropriate quantities for their cooking endeavors.
  
<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Learning Goal
* Large Language Model (Llama2)
* Full-stack App Design
* User Experience

<!-- GETTING STARTED -->
Note: This code is inspired by Trelis [HuggingFace](https://huggingface.co/Trelis) and [YouTube](https://www.youtube.com/@TrelisResearch).

## Getting Started

### Prerequisite

#### Install Architecture
If you are using Apple Silicon (M1) Mac, make sure you have installed a version of Python that supports arm64 architecture; Otherwise, while installing it will build the llama.ccp x86 version which will be 10x slower on Apple Silicon (M1) Mac. To install arm64 architecture on your laptop, run the following code on your laptop terminal:
```zsh
arm64path = "Miniforge3-MacOSX-arm64.sh"
wget https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-MacOSX-arm64.sh
bash Miniforge3-MacOSX-arm64.sh
```

#### React
If you do not have React installed on your laptop, you need to install some packages. I highly recommend this [video tutorial](https://www.youtube.com/watch?v=HWpjpq2ux04), which is only 4'30'' long, but explains the installation step by step very well.

node: https://nodejs.org/en/download/ 
npx: https://www.npmjs.com/package/npx
react router: https://reactrouter.com 
react dropzone: https://github.com/react-dropzone
redux toolkit: https://redux-toolkit.js.org

### Installation
#### Clone the repo

You can clone the repository in your local directory.
```zsh
git clone [https://github.com/](https://github.com/AstridZhao/AI_recipe.git)
```
#### Install essential packages
To have all the packages needed to run the code, you can run the below code in the **terminal** with the main program directory:
```zsh
pip install -r requirements.txt
```
<p align="right">(<a href="#readme-top">back to top</a>)</p>

#### Install Llama.cpp
The main goal of llama.cpp is to run the LLaMA model using 4-bit integer quantization on a MacBook. The instructions below are for Macs with an **M1 chip**.
For other operating systems, you can find instructions [here](https://github.com/TrelisResearch/llamacpp-install-basics/blob/main/instructions.md).

Run the below code in **terminal**. Make sure the current directory should be the main program directory.
```zsh
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
LLAMA_METAL=1 make
cd ..
```
Then, after installing llama.cpp, we can require the specific llama model from [Huggingface](https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF). In this project, we chose to use  "llama-2-7b-chat.Q4_K_M.gguf". Run the below code in the **terminal**.
```zsh
cd llama.cpp
wget https://huggingface.co/TheBloke/Llama-2-7b-Chat-GGUF/resolve/main/llama-2-7b-chat.Q4_K_M.gguf
cd ..
```
> :warning: If you cannot pull the model successfully, you might need to ask authorization from meta-llama by filling a simple 1-minute form with your Huggingface user email address. You can find the model page [here](https://huggingface.co/meta-llama/Llama-2-7b-chat-hf). After you get authorization from meta-llama, you should be able to download and deploy the model.

Now you have the llama model available to run on your laptop. 

To test if your installation is successful, you can do it with the below code in the **terminal**:
```zsh
cd llama.cpp
./main -m llama-2-7b-chat.Q4_K_M.gguf -c 1024 -ngl 8 -p "Where is new york?"
```
<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE -->
## Usage

### Initiate Program 

To run this program project, you need to start the flask backend by using 
```zsh
cd ....{your master directory}/AI_recipe/flask
python3 server.py
```
under the "flask" folder, and run react by using 
```zsh
cd ....{your master directory}/AI_recipe/client
npm start
```
under the "client" folder.

You need to run each command in a different terminal. You can do this by splitting the terminal in your VS code. 
<img width="1056" alt="image" src="https://github.com/AstridZhao/AI_recipe/assets/79214456/cd2dfae8-8e75-4f36-a354-f7cabdab7e17">

After starting both servers, the react will bring you to the user interface. 
<img width="1426" alt="image" src="https://github.com/AstridZhao/AI_recipe/assets/79214456/dadb7755-7fe3-44b1-b71f-0c2453e86299">

### Program Function

#### * Customize Recipe
In this app, you can customize the following parts to customize your recipe.
* **Ingredients**: you can choose ingredients by either clicking the ingredient buttons or manually typing the ingredients in the ingredient input box.
* **Serving Size**
* **Cuisine Style**: you can input any cuisine style you prefer, such as Asian, American, Mexican, Italian, etc.
* **Dish Type**: are you looking for breakfast, or a quick meal, or dinner? There are 8 types you can choose.
* **Cooking Method**: do you like to use an air fryer, stir fry, oven baking, or others?
* **Dietary Restriction**: it helps you filter your restriction, e.g. Vegan, Vegetarian, Nut-allergy, etc.

[Demo: Customization Functionality](https://drive.google.com/file/d/1diQn-5NX-Csf8Vrbpp8C26oZiVvSRE1c/view?usp=sharing)

#### * Start the Recipe Generation

After completing the customization, you can click the button "RECIPE START" to start the recipe generation. Note the waiting time for the Llama model to start is about 15 seconds.

[Demo: Generation Functionality](https://drive.google.com/file/d/1dkKgmHzZV6wUf3xC-Xxjq94wpI6J4T36/view?usp=sharing)

#### * Copy the Recipe

After finishing the recipe, you can copy the recipe to the clipboard so that easily share it with your friends or family. 

[Demo: Copy Functionality](https://drive.google.com/file/d/1dhLK8Z0LAwmSZsBhNqTgpcC8hCtp3sND/view?usp=sharing)
