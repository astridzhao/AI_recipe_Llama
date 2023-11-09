from flask import Flask, request, jsonify
import os, subprocess, re
from flask_restx import Api, Resource, fields
from werkzeug.middleware.proxy_fix import ProxyFix
from flask_cors import CORS
from queue import SimpleQueue
from threading import Thread


app = Flask(__name__)
#wraps the application's WSGI application with a middleware component from Werkzeug called ProxyFix
#your application is behind a proxy that terminates SSL connections
app.wsgi_app = ProxyFix(app.wsgi_app)
# Cross-Origin Resource Sharing:
CORS(app)
api = Api(app)
ns = api.namespace('recipes', description='Recipe Generation')


# Specifies the input format:
recipe_input = api.model('Recipe', {
    'ingredient': fields.String(readonly=True, description='The ingredient list'),
})

# Specifies a response format:
recipe_response = api.model('RecipeResponse', {
    'llm_output': fields.String(required=True, description='Llama answer'),
})

class recipeDAO(object):
    def __init__(self):
        self.ingredient = " "
        
    def generate(self, request):
    
    #get user input by using request
        user_input = request['ingredient']
        #initialize the dialog
        SYSTEM_PROMPT = f"""You are a helpful recipe-generating assistant. Based on the following given ingredients, you will generate a short recipe. Make sure to follow the rules listed below: 1. Please don't give a very long recipe, make the description in 200-300 words. 2. Warn the user if there is any common allergies ingredients in your recipe. 3. If you will need to use any ingredients outside of the ingredients that the user provided, Warn the user. 4. Provide other essential information about the recipe such as kitchen utensils, preparation steps. 5. Choose some common spice/sauce first, unless the user provided a very specific sauce want to use. 6. The default serving size is 2, unless the user specifies. 7. The default dish style is American/Italian cuisine, unless the user specifies. 8. The default type of dish is airfry/oven/stir-fry, unless the user specifies. 9. Use both text and some cute emoji if you can. """
        dialog_history = [{"role": "system", "content": SYSTEM_PROMPT}]
        dialog_history.append({"role": "user", "content": user_input})

        
        prompt = assemple_prompt(user_input, SYSTEM_PROMPT)
        
        llama_cpp_path = "/Users/astridz/Documents/AI_recipe/llama.cpp"
        pure_name = 'llama-2-7b-chat.Q4_K_M.gguf'
        local_directory = "/Users/astridz/Documents/AI_recipe/flask"
        
        if (os.getcwd() != llama_cpp_path):
            os.chdir(llama_cpp_path)
        
        args = ['./main', '-m', pure_name, '-c', '2048', '-ngl', '48', '-p', prompt]
        
        q = SimpleQueue()

        # process = subprocess.Popen(args, stdout=subprocess.PIPE, text=True)
        
        # output = process.stdout.read()
        
        # marker_index = output.find("[/INST]")
        # if marker_index != -1:
        #     assistant_response = output[marker_index + len("[/INST]"):] 

        # dialog_history.append({"role": "assistant", "content": assistant_response})
        assistant_response = user_input +"\n new recipe"
        response = {'llm_output': assistant_response}
        
# Testing:         
        # while True:
        #     output = process.stdout.readline()
            
        #     if output == '' and process.poll() is not None:
        #         print("Subprocess has completed.")
        #         break
            
        #     if output:
        #         assistant_response = output.strip()
        #         q.put(assistant_response)
        #         dialog_history.append({"role": "assistant", "content": assistant_response})
                
        # while not q.empty():
        #     line = q.get_nowait()
        #     response ={'llm_output' : line}
        #     return response
        
# Testing: 
        # def thread_function(dialog_history, q, process):
        #     generate_text(dialog_history, q, process)
        
        # # # Start the thread to collect subprocess output
        # thread = Thread(target=thread_function, args=(dialog_history, q, process))
        # thread.start()
        # # Wait for the subprocess and thread to finish
        # process.wait()
        
        # # Collect the output from the queue
        # generated_text_collection = []
        # while not q.empty():
        #     line = q.get_nowait()
        #     print("current line is: ", line)
        #     generated_text_collection.append(line)
        # generated_text_collection = generate_text(dialog_history, q, args) 
        # thread.join()  # Wait for the thread to finish
        # response ={'llm_output' : "".join(generated_text_collection)}
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

    
def assemple_prompt(user_input, SYSTEM_PROMPT):
    
    # Use Llama model to generate text
    prompt_template = f'''[INST] <<SYS>>
                        {SYSTEM_PROMPT}
                        <</SYS>>
                        {user_input} [/INST]'''
    
    return prompt_template

# { "ingredient" : "tomato and egg"}
def generate_text(dialog_history, q, process: str) -> str:

    while True:
        output = process.stdout.readline()
        
        if output == '' and process.poll() is not None:
            print("Subprocess has completed.")
            break
        
        if output:
            assistant_response = output.strip()
            q.put(assistant_response)
            dialog_history.append({"role": "assistant", "content": assistant_response})
        
            # if '[INST]' in output or '<>' in output:
            #     continue 
            
            # marker_index = output.find("[/INST]")
            # if marker_index != -1:
            #     assistant_response = output[marker_index + len("[/INST]"):]
            
            # print(assistant_response)
        #     dialog_history.append({"role": "assistant", "content": assistant_response})
        # return assistant_response
            
if __name__ == "__main__":
    app.run(debug=True)