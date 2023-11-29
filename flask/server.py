from flask import Flask, request, jsonify, Response
import os, subprocess, re
from flask_restx import Api, Resource, fields
from werkzeug.middleware.proxy_fix import ProxyFix
from flask_cors import CORS
import queue
import threading
import uuid, time

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app)
CORS(app)
api = Api(app)
ns = api.namespace('recipes', description='Recipe Generation')

recipe_input = api.model('Recipe', {
    'cuisine_style': fields.String(description='The cuisine style'),
    'ingredient': fields.String(description='The ingredient list'),
    'serving_size': fields.Integer(description='The serving size setting'),
    'dietary_restriction': fields.String(description='The dietary restriction setting'),
    'typedish' : fields.String(description='The dish type setting'),
    'cooking_method': fields.String(description='The cooking method setting'),
})

request_id = api.model('requestID', {
    'request_id': fields.String(required=True, readonly=True, description='Llama answer'),
})
recipe_response = api.model('RecipeResponse', {
    'llm_output': fields.String(required=True, readonly=True, description='Llama answer'),
})

# Queue to hold the subprocess output lines
output_queues = {}
# queue = queue.Queue()

class recipeDAO(object):  
    def generate(self, request, request_id):
        
        # Extract user inputs from the request dictionary
        user_input = request.get('ingredient')
        cuisine_style = request.get('cuisine_style')
        serving_size = request.get('serving_size')
        dietary_restriction = request.get("dietary_restriction")
        dish_type = request.get("typedish")
        cooking_method = request.get("cooking_method")

        # Initialize the dialog
        SYSTEM_PROMPT = f"""As a recipe-generating assistant, your role is to create a recipe based on the some ingredients provided by the user. \
        To ensure a precise and high-quality response, please follow these guidelines:\
        1. Must include 5 sections in this order: Title, Ingredient List, Step-by-Step Instructions, Expected Cooking Time, and Note. Limit your response to 150-200 words. \
        2. If you need use any ingredients outside the user's list, warn the user and give some alternative options. \
        3. Dish type should be {dish_type}. Cuisine style should be {cuisine_style}, so use some special sauce/spice. The cooking method should be {cooking_method}.\
        4. The recipe should be scaled to serve {serving_size} adults.  \
        5. Be mindful of {dietary_restriction} restriction. """

        dialog_history = [{"role": "system", "content": SYSTEM_PROMPT}]
        dialog_history.append({"role": "user", "content": user_input})

        llama_cpp_path = "/Users/astridz/Documents/AI_recipe/llama.cpp"
        pure_name = 'llama-2-7b-chat.Q4_K_M.gguf'
        
        os.chdir(llama_cpp_path)
        
        B_INST, E_INST = "[INST]", "[/INST]"
        B_SYS, E_SYS = "<<SYS>>\n", "\n<</SYS>>\n\n"
        SYSTEM_PROMPT = B_SYS + SYSTEM_PROMPT + E_SYS
        template = B_INST + SYSTEM_PROMPT + user_input + E_INST
        args = ['./main', '-m', pure_name, '--multiline-input', '-b', '1024',  '-ngl', '8', '-p', template]
        output_queues[request_id] = queue.Queue()
        threading.Thread(target=self.run_subprocess, args=(args, request_id)).start()
        return {"request_id": request_id, "message": "Processing your request."}

    # runs in a separate thread, 
    # handles the actual subprocess execution and reads its output line by line, 
    # putting each line into output_queue
    def run_subprocess(self, args, request_id):
        local_directory = "/Users/astridz/Documents/AI_recipe/flask"
        process = subprocess.Popen(args, stdout=subprocess.PIPE, text=True)
        while True:
            line = process.stdout.readline()
            if line:
                if '[/INST]' in line:
                    marker_index = line.find("[/INST]")
                    if marker_index != -1:
                        newline =  line[marker_index + len("[/INST]  "):] 
                        output_queues[request_id].put(newline)
                        print(newline)
                elif "[INST]"  in line or "<</SYS>>" in line or "As a recipe-generating assistant," in line:
                    continue
                else:
                    if line == "":
                        continue
                    else:
                        print(line)
                        output_queues[request_id].put(line)
            else:
                output_queues[request_id].put("Recipe completed.")
                os.chdir(local_directory)
                process.stdout.close()
            #     // args = ['curl', '-X', 'OPTIONS', 'http://127.0.0.1:5000/recipes/recipe', '-i']
            #   // newprocess = subprocess.Popen(args, stdout=subprocess.PIPE, text=True)
            #   // stdout = newprocess.communicate()
            #   // newprocess.stdout.close()
                break    

DAO = recipeDAO()

@ns.route('/recipe', methods=['POST'])
class Recipe(Resource):
    @ns.doc('generate_recipe')
    @ns.expect(recipe_input)
    @ns.marshal_with(recipe_response, code=201)
    def post(self):
        '''Create a new task'''
        request_id = str(uuid.uuid4()) 
        DAO.generate(api.payload, request_id) 
        return {"llm_output": request_id}, 201


@ns.route('/recipe/<request_id>', methods=['GET'])
class RecipeResult(Resource):
    @ns.doc('get_recipe_output')
    @ns.marshal_with(recipe_response, code=200)
    def get(self, request_id):
        '''Get the result of the recipe generation'''
        if request_id in output_queues or not output_queues[request_id].empty():
                return {"llm_output": output_queues[request_id].get()}, 200
        else:
            return {"message": "No result available yet. Please try again later."}, 202


if __name__ == "__main__":
    app.run(debug=True)
