from transformers import AutoModelForCausalLM, AutoTokenizer, AutoModel
import transformers
import torch

# model_identifier = "TheBloke/llama-2-7b.Q4_K_M.gguf"
model_identifier = "meta-llama/Llama-2-13b-chat-hf"
# model_identifier = "meta-llama/Llama-2-70b-chat-hf"
# # Use the correct Hugging Face Model Hub identifier
token = "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"

tokenizer = AutoTokenizer.from_pretrained(model_identifier, use_auth_token=True)
pipeline = transformers.pipeline(
    "text-generation",
    model=model_identifier,
    torch_dtype=torch.float16,
    device_map="auto",
)

sequences = pipeline(
    'I liked "Breaking Bad" and "Band of Brothers". Do you have any recommendations of other shows I might like?\n',
    do_sample=True,
    top_k=10,
    num_return_sequences=1,
    eos_token_id=tokenizer.eos_token_id,
    max_length=200,
)
for seq in sequences:
    print(f"Result: {seq['generated_text']}")

