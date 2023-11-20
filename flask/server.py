from flask import Flask, request, jsonify
import os, subprocess, re
from flask_restx import Api, Resource, fields
from werkzeug.middleware.proxy_fix import ProxyFix
from flask_cors import CORS
from queue import SimpleQueue
from threading import Thread
import time


app = Flask(__name__)
#wraps the application's f with a middleware component from Werkzeug called ProxyFix
#your application is behind a proxy that terminates SSL connections
app.wsgi_app = ProxyFix(app.wsgi_app)
# Cross-Origin Resource Sharing:
CORS(app)
api = Api(app)
ns = api.namespace('recipes', description='Recipe Generation')

# Specifies the input format:
recipe_input = api.model('Recipe', {
    'cuisine_style': fields.String(description='The cuisine style'),
    'ingredient': fields.String( description='The ingredient list'),
    'serving_size': fields.Integer(description='The serving size setting'),
    'dietary_restriction': fields.String(description='The dietary restriction setting'),
})

# Specifies a response format:
recipe_response = api.model('RecipeResponse', {
    'llm_output': fields.String(required=True, readonly=True, description='Llama answer'),
})

class recipeDAO(object):    
    def generate(self, request):
        # Extract user inputs from the request dictionary
        user_input = request.get('ingredient')  # Provide a default value if key is not found
        cuisine_style = request.get('cuisine_style')  # Default to 'Asian' if not provided
        serving_size = request.get('serving_size')  # Default to 2 if not provided
        dietary_restriction = request.get("dietary_restriction")
        
        #initialize the dialog
        # 
        SYSTEM_PROMPT = f"""You are a helpful recipe-generating assistant. Based on the user provided ingredients, you will generate a recipe. \
        Adjust recipe by following the rules: \
        1. Describe Ingredient List, Instruction in 150 words. \
        2. If you need add any other ingredients, tell the user. \
        3. Serving size is for {serving_size} adults. Cuisine style is {cuisine_style}. \
        4. Notice the user has {dietary_restriction} restriction."""
        # 6. You don't have to use all ingredients.
        # 3. Choose some common spice/sauce. \
        # 4. Provide information about the recipe such as kitchen utensils, preparation steps. 
        
        dialog_history = [{"role": "system", "content": SYSTEM_PROMPT}]
        dialog_history.append({"role": "user", "content": user_input})
        
        #Testing: 2nd version
        # prompt = f"I am very new to cook. Use {user_input}, generate a detailed recipe description, including kitchen utensil, cooking methods, etc. Make the description about {length} words. Print the recipe in a nice format. Choose some common spice/sauce first. The serving size is {serving_size}. The cuisine style is {cuisine_style}. "
        # prompt = f"As a beginner in cooking, I need a detailed recipe using {user_input}.Please include kitchen utensils, how much ingredients I need to use, cooking methods, and a nicely formatted recipe. Aim for in {length} words. Start with common spices or sauces. The serving size should be for {serving_size} people, and the cuisine style is {cuisine_style}.I would appreciate detailed instructions on how to prepare each dish, including cooking time."

        llama_cpp_path = "/Users/astridz/Documents/AI_recipe/llama.cpp"
        pure_name = 'llama-2-7b-chat.Q4_K_M.gguf'
        local_directory = "/Users/astridz/Documents/AI_recipe/flask"
        
        if (os.getcwd() != llama_cpp_path):
            os.chdir(llama_cpp_path)
        
        B_INST, E_INST = "[INST]", "[/INST]"
        B_SYS, E_SYS = "<<SYS>>\n", "\n<</SYS>>\n\n"
        SYSTEM_PROMPT = B_SYS + SYSTEM_PROMPT + E_SYS
        template = B_INST + SYSTEM_PROMPT + user_input + E_INST
        
        # ./main -m llama-2-7b-chat.Q4_K_M.gguf -c 2048 -b 1024 -p "<<SYS>you are a helpful recipe-generate assistant\n<</SYS>>\n\n"
        
        args = ['./main', '-m', pure_name, '-c', '2048', '-n', '1024', '-b', '1024', '-p', template]

        if (os.getcwd() != llama_cpp_path):
            os.chdir(llama_cpp_path)
        
        process = subprocess.Popen(args, stdout=subprocess.PIPE, text=True)
        start_time = time.time()
        output = process.stdout.read()
        # Testing:
        # dialog_history.append({"role": "assistant", "content": output})
        # response = {'llm_output': output}

        marker_index = output.find("[/INST]")
        assistant_response = ""
        if marker_index != -1:
            assistant_response = output[marker_index + len("[/INST]"):] 
        dialog_history.append({"role": "assistant", "content": assistant_response})
        response = {'llm_output': assistant_response}

        end_time = time.time()
        elapsed_time = end_time - start_time
        print("total time :",  elapsed_time)
        return response

DAO = recipeDAO()

@ns.route('/recipe')

class TodoList(Resource):
    '''generate the response'''
    @ns.doc('generate_recipe')
    #set the system will expect the input:
    @ns.expect(recipe_input)
    #take the output of that function and format it according to a specific model
    @ns.marshal_with(recipe_response, code=201)
    
    def post(self):
        '''Create a new task'''
        return DAO.generate(api.payload), 201
            
if __name__ == "__main__":
    app.run(debug=True)