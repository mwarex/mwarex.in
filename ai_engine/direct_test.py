import os
import sys

# Change dir to ai_engine so it finds .env
os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.getcwd())

from app import process_video_background

# Using a public test video for testing
test_video_url = "https://www.w3schools.com/html/mov_bbb.mp4"

print("Starting direct processing...")
process_video_background("test-123", test_video_url, "Make it cool")
print("Done direct processing.")
