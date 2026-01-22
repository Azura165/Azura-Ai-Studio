import requests
import os

# Create dummy images if they don't exist
if not os.path.exists("test_image_1.jpg"):
    with open("test_image_1.jpg", "wb") as f:
        f.write(b"dummy content 1")
if not os.path.exists("test_image_2.jpg"):
    with open("test_image_2.jpg", "wb") as f:
        f.write(b"dummy content 2")

url = "http://localhost:5000/api/remove-bg"
files = [
    ('images', ('test_image_1.jpg', open('test_image_1.jpg', 'rb'), 'image/jpeg')),
    ('images', ('test_image_2.jpg', open('test_image_2.jpg', 'rb'), 'image/jpeg'))
]

try:
    response = requests.post(url, files=files)
    print("Status Code:", response.status_code)
    print("Response JSON:", response.json())
except Exception as e:
    print("Verification failed (is the server running?):", e)
