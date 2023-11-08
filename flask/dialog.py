import subprocess
import threading
import re
import os
import fire 

def main():
    # Download the model file
    llama_cpp_path = "/Users/astridz/Documents/AI_recipe/llama.cpp"
    pure_name = 'llama-2-7b-chat.Q4_K_M.gguf'
    local_directory = "/Users/astridz/Documents/AI_recipe/flask"

    #-------------------------------------------->
    # Function to handle the subprocess output and update the dialog history
    def generate_response(process):
        while True:
            output = process.stdout.readline()
            #reinitialize assistant_response each time
            if process.poll() is not None and output == '':
                print("Subprocess has completed.")
                break 
            if output:
                # if '<<SYS>>' or '</SYS>>' in output:
                #     continue
                if '[/INST]' in output:
                    inst_index = output.find('[/INST]')
                    # Check if [/INST] is found in the text
                    if inst_index != -1:
                        # Print everything after [/INST]
                        assistant_response = output[inst_index + len('[/INST]'):].strip()
                else:
                    assistant_response = f"{output.strip()}"
                dialog_history.append({"role": "assistant", "content": assistant_response})
                
                if assistant_response:
                    print(f'{assistant_response}\n')
            else:
                break
        process.stdout.close()
    #-------------------------------------------->  
    def print_dialog_history(dialog_history):
        for message in dialog_history:
            print(f'**{message["role"].capitalize()}**: {message["content"]}\n')
            
            
    DEFAULT_SYSTEM_PROMPT = f"""You are a helpful recipe-generating assistant. Based on the following given ingredients, you will generate a recipe. Make sure to follow the rules listed below: 1. Please don't give a very long recipe (more than 1000 words), make the description in 500-1000 words. 2. Warn the user if there is any common allergies ingredients in your recipe. 3. If you will need to use any ingredients outside of the ingredients that the user provided, Warn the user. 4. Provide other essential information about the recipe such as kitchen utensils, preparation steps. 5. Choose some common spice/sauce first, unless the user provided a very specific sauce want to use. 6. The default serving size is 2, unless the user specifies. 7. The default dish style is American/Italian cuisine, unless the user specifies. 8. The default type of dish is airfry/oven/stir-fry, unless the user specifies. 9. Use both text and some cute emoji if you can. """

    SYSTEM_PROMPT = DEFAULT_SYSTEM_PROMPT

    #initialize the dialog
    dialog_history = [{"role": "system", "content": SYSTEM_PROMPT}]

    print_dialog_history(dialog_history)
    
    # Get user input and append it to the dialog history
    user_input = input("Hello! I am AI recipe assistant, how can I help you? Please enter your ingredient: ")
    dialog_history.append({"role": "user", "content": user_input})
    

    prompt_template = f'''[INST] <<SYS>>
                        {SYSTEM_PROMPT}
                        <</SYS>>
                        {user_input} [/INST]'''
        
    # Start the subprocess and the threading to handle its output
    if (os.getcwd() != llama_cpp_path):
        os.chdir(llama_cpp_path)
        
    args = ['./main', '-m', pure_name, '-c', '2048', '-ngl', '48', '--color', '-p', prompt_template]
    process = subprocess.Popen(args, stdout=subprocess.PIPE, text=True)
    # Start the thread that will handle the subprocess output
    output_thread = threading.Thread(target=generate_response, args=(process,))
    output_thread.start()
    print("start thread \n")
    # Wait for the subprocess and thread to finish
    process.wait()
    output_thread.join()

    os.chdir(local_directory)

# This will expose the function 'greet' as a CLI command.
if __name__ == "__main__":
    fire.Fire(main)