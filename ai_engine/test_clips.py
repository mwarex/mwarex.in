import os
import sys

# Change dir to ai_engine so it finds .env
os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.getcwd())

from app import extract_clips_background

print("Starting direct clip extraction...")
# Using a 2 minute video for fast test
extract_clips_background("https://www.youtube.com/watch?v=jNQXAC9IVRw", None, None, "room123", "creator123")
print("Done.")
