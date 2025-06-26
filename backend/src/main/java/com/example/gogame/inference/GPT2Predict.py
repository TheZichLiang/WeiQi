import sys
from transformers import GPT2LMHeadModel, GPT2Tokenizer
import re

difficulty = sys.argv[1]
prompt = sys.stdin.readline().strip()

model = GPT2LMHeadModel.from_pretrained("/home/ec2-user/inference/checkpoint_gpt2")
tokenizer = GPT2Tokenizer.from_pretrained("/home/ec2-user/inference/checkpoint_gpt2")

if difficulty == "ddk":
    generation_args = {"do_sample": False, "max_new_tokens": 5}
elif difficulty == "sdk":
    generation_args = {"do_sample": True, "top_k": 40, "temperature": 0.8, "max_new_tokens": 5}
elif difficulty == "low-dan":
    generation_args = {"do_sample": True, "top_p": 0.9, "temperature": 1.0, "max_new_tokens": 5}
elif difficulty == "high-dan":
    generation_args = {"do_sample": True, "top_k": 80, "top_p": 0.95, "temperature": 1.2, "max_new_tokens": 6}

input_ids = tokenizer(prompt, return_tensors="pt").input_ids
attention_mask = input_ids.ne(tokenizer.pad_token_id).long()

output = model.generate(
    input_ids,
    attention_mask=attention_mask,
    pad_token_id=tokenizer.eos_token_id,
    **generation_args
)
generated_text = tokenizer.decode(output[0])
# Extract all moves from prompt and output
prompt_moves = re.findall(r"[BW][a-s]{2}|PASS", prompt)
output_moves = re.findall(r"[BW][a-s]{2}|PASS", generated_text)
# Remove prompt moves from the beginning of output_moves
while output_moves and prompt_moves and output_moves[0] == prompt_moves[0]:
    output_moves.pop(0)
    prompt_moves.pop(0)
# Return the first new move
print(output_moves[0] if output_moves else "PASS", flush=True)
