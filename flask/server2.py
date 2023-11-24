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

        # Initialize the dialog
        SYSTEM_PROMPT = f"""You are a helpful recipe-generating assistant. Based on the user provided ingredients, you will generate a recipe. \
        Adjust recipe by following the rules: \
        1. Describe Ingredient List and Instruction in 150 words. \
        2. If you need use any ingredients outside the user's list, warn the user. \
        3. Serving size is for {serving_size} adults, multiply ingredients size accordingly. Cuisine style is {cuisine_style}. \
        4. Notice the user has {dietary_restriction} restriction. \
        5. Add some emoji reflecting the words."""

        dialog_history = [{"role": "system", "content": SYSTEM_PROMPT}]
        dialog_history.append({"role": "user", "content": user_input})

        llama_cpp_path = "/Users/astridz/Documents/AI_recipe/llama.cpp"
        pure_name = 'llama-2-7b-chat.Q4_K_M.gguf'
        local_directory = "/Users/astridz/Documents/AI_recipe/flask"
        
        if (os.getcwd() != llama_cpp_path):
            os.chdir(llama_cpp_path)
        
        B_INST, E_INST = "[INST]", "[/INST]"
        B_SYS, E_SYS = "<<SYS>>\n", "\n<</SYS>>\n\n"
        SYSTEM_PROMPT = B_SYS + SYSTEM_PROMPT + E_SYS
        template = B_INST + SYSTEM_PROMPT + user_input + E_INST
        args = ['./main', '-m', pure_name, '-c', '2048', '-n', '1024', '-b', '1024',  '-ngl', '2', '-p', template]

        # # Start a new thread for running the subprocess
        # # Testing: threading.Thread(target=self.run_subprocess, args=(args,)).start()
        # request_id = str(uuid.uuid4())  # Generate a unique request ID
        output_queues[request_id] = queue.Queue()
        threading.Thread(target=self.run_subprocess, args=(args, request_id)).start()
        return {"request_id": request_id, "message": "Processing your request."}
        # return {"message": "Processing your request. Please check back later for the result."}
    
    # runs in a separate thread, 
    # handles the actual subprocess execution and reads its output line by line, 
    # putting each line into output_queue
    def run_subprocess(self, args, request_id):
        process = subprocess.Popen(args, stdout=subprocess.PIPE, text=True)
        while True:
            line = process.stdout.readline()
            start_time = time.time()
            if line:
                if '[/INST]' in line:
                    marker_index = line.find("[/INST]")
                    if marker_index != -1:
                        newline =  line[marker_index + len("[/INST]"):] 
                        output_queues[request_id].put(newline)
                        print(newline)
                elif "[INST]"  in line or "<</SYS>>" in line or "You are a helpful recipe-generating assistant." in line:
                    continue
                else:
                    if line == "":
                        continue
                    else:
                        end_time = time.time()
                        elapsed_time = end_time - start_time
                        print("total time :",  elapsed_time)
                        print(line)
                        output_queues[request_id].put(line)
            else:
                break
            
        # print(output_queues[request_id].get())
            
DAO = recipeDAO()

@ns.route('/recipe', methods=['POST'])
class Recipe(Resource):
    @ns.doc('generate_recipe')
    @ns.expect(recipe_input)
    # @ns.marshal_with(recipe_response, code=202)
    def post(self):
        '''Create a new task'''
        request_id = str(uuid.uuid4())  # Generate a unique request_id
        DAO.generate(api.payload, request_id) 
        return {"llm_output": request_id}, 202
        # return DAO.generate(api.payload), 202


# @app.route('/recipe', defaults={'string': ''})
@ns.route('/recipe/<request_id>',  methods=['GET'])
class RecipeResult(Resource):
    # A new endpoint /recipe/result is added for clients
    # to check and retrieve the results line by line
    @ns.doc('get_recipe_output')
    @ns.marshal_with(recipe_response, code=200)
    def get(self, request_id):
        '''Get the result of the recipe generation'''
        if request_id in output_queues or not output_queues[request_id].empty():
                console.log(output_queues[request_id].get())
                return {"llm_output": output_queues[request_id].get()}, 200
            # else:
            #     del output_queue[request_id]
            #     return {"llm_output": "Generation complete."}, 200
        else:
            return {"message": "No result available yet. Please try again later."}, 202

if __name__ == "__main__":
    app.run(debug=True)
