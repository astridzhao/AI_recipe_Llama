from transformers import AutoModelForCausalLM, AutoTokenizer, AutoModel
import transformers
import torch

# model_identifier = "TheBloke/llama-2-7b.Q4_K_M.gguf"
# model_identifier = "meta-llama/Llama-2-13b-chat-hf"
# model_identifier = "meta-llama/Llama-2-70b-chat-hf"
# # Use the correct Hugging Face Model Hub identifier
model_identifier = "daryl149/llama-2-7b-chat-hf"
token = "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"
"""
Avaiable paramters for transformer: https://huggingface.co/docs/transformers/main_classes/configuration#transformers.PretrainedConfig
"""
model = AutoModelForCausalLM.from_pretrained(model_identifier)
                                            #  use_auth_token=True, 
                                            #  device_map={
                                            #             "transformer.word_embeddings": 'cpu',
                                            #             # "transformer.word_embeddings_layernorm": 'cpu',
                                            #             # "lm_head": 'cpu',
                                            #             'lm_head.weight': 'cpu',
                                            #             # "transformer.h": 'cpu',
                                            #             # "transformer.ln_f": 'cpu',
                                            #             "model.embed_tokens": 'cpu',
                                            #             "model.layers":'cpu',
                                            #             # "model.norm":'cpu',
                                            #             "embed_tokens.weight": 'cpu',
                                            #             })
                                           
# model = AutoModelForCausalLM.from_pretrained(model_identifier, use_auth_token=True, device_map='auto')
tokenizer = AutoTokenizer.from_pretrained(model_identifier)

prompt = """Hi, How are You?"""
inputs = tokenizer(prompt, return_tensors="pt")
outputs = model.generate(**inputs, max_new_tokens=20, max_length= 300).to("cuda")
response = tokenizer.decode(outputs[0], skip_special_tokens=True)
print(response)