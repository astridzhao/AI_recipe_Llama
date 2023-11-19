import subprocess
import threading
import re
import os

# Special tokens
B_INST, E_INST = "<s>[INST]", "[/INST]"
B_SYS, E_SYS = "<<SYS>>\n", "\n<</SYS>>\n\n"

# Function to handle the subprocess output and update the dialog history
def generate_response(process):
    while True:
        output = process.stdout.readline()
        if process.poll() is not None and output == '':
            print("Subprocess has completed.")
            break
        if output:
            if '[INST]' in output or '<>' in output:
                continue  # Skip this iteration and don't print anything
                
            assistant_response = f"{output.strip()}"
            dialog_history.append({"role": "assistant", "content": assistant_response})
            # Print the dialog history
            print_dialog_history()
        else:
            break
    process.stdout.close()

def print_dialog_history():
    for message in dialog_history:
        print(f'**{message["role"].capitalize()}**: {message["content"]}\n')

# Initialize the dialog history with the system prompt
DEFAULT_SYSTEM_PROMPT = f"""You are a helpful recipe-generating assistant. Based on the following given ingredients, you will generate a recipe. Make sure to follow the rules listed below: 1. Please don't give a very long recipe (more than 1000 words), make the description in 500-1000 words. 2. Warn the user if there is any common allergies ingredients in your recipe. 3. If you will need to use any ingredients outside of the ingredients that the user provided, Warn the user. 4. Provide other essential information about the recipe such as kitchen utensils, preparation steps. 5. Choose some common spice/sauce first, unless the user provided a very specific sauce want to use. 6. The default serving size is 2, unless the user specifies. 7. The default dish style is American/Italian cuisine, unless the user specifies. 8. The default type of dish is airfry/oven/stir-fry, unless the user specifies. """

SYSTEM_PROMPT = DEFAULT_SYSTEM_PROMPT
    
dialog_history = [{"role": "system", "content": SYSTEM_PROMPT}]

# Get user input and append it to the dialog history
user_input = input("Please enter your input: ")
dialog_history.append({"role": "user", "content": user_input})

# Print the initial dialog history
# print_dialog_history()
    
prompt_template = f'''<s>[INST]<<SYS>>\n
                        {SYSTEM_PROMPT}
                        \n<</SYS>>\n\n
                        {user_input}[/INST]'''
# Start the subprocess and the threading to handle its output
# # Generate response
if (os.getcwd() != "/Users/astridz/Documents/AI_recipe/llama.cpp"):
    os.chdir('/Users/astridz/Documents/AI_recipe/llama.cpp')

pure_name = "llama-2-7b-chat.Q4_K_M.gguf"
args = ['./main', '-m', pure_name, '-c', '2048', '-ngl', '48', '-p', prompt_template]

process = subprocess.Popen(args, stdout=subprocess.PIPE, text=True)
# Start the thread that will handle the subprocess output
output_thread = threading.Thread(target=generate_response, args=(process,))
output_thread.start()

# Wait for the subprocess and thread to finish
process.wait()
output_thread.join()

os.chdir('/Users/astridz/Documents/AI_recipe')