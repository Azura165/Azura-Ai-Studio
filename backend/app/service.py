import os
import torch
from PIL import Image
from rembg import remove
import io

def gpu_info():
    if torch.cuda.is_available():
        return {
            "available": True,
            "name": torch.cuda.get_device_name(0),
            "memory": f"{torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB"
        }
    return {"available": False, "name": "CPU", "memory": "N/A"}

def remove_background(input_path, output_dir):
    try:
        # Read input image
        with open(input_path, 'rb') as i:
            input_data = i.read()
        
        # Remove background
        output_data = remove(input_data)
        
        # Generate output filename
        filename = os.path.basename(input_path)
        name, _ = os.path.splitext(filename)
        output_filename = f"{name}_nobg.png"
        output_path = os.path.join(output_dir, output_filename)
        
        # Save output image
        with open(output_path, 'wb') as o:
            o.write(output_data)
        
        # Clean up input file
        if os.path.exists(input_path):
            os.remove(input_path)
            
        return output_path
        
    except Exception as e:
        # Clean up on error
        if os.path.exists(input_path):
            os.remove(input_path)
        raise Exception(f"Error removing background: {str(e)}")