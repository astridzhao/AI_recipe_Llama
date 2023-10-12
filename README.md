# Chef Transformer Usage Example

This is only for using chef-transformer using the `flax-community/t5-recipe-generation` model.


**Setup**

```bash
python3 -m venv venv
source ./venv/bin/activate
pip install -r requirements.txt
python3 chef.py
```

**Cleanup**
```bash
deactivate
rm -rf ./venv
```