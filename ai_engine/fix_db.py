import os
import pymongo
from dotenv import load_dotenv

load_dotenv('../backend/.env')
MONGO_URI = os.getenv('MONGO_URI')

if MONGO_URI:
    client = pymongo.MongoClient(MONGO_URI)
    db = client.get_default_database()
    # Or just guess the db name if it's in URI
    
    # reset ai_processing to raw_rejected
    res = client['mwarex']['videos'].update_many(
        {'status': 'ai_processing'},
        {'$set': {'status': 'raw_rejected', 'rejectionReason': 'Interrupted by server reload/Quota Limit.'}}
    )
    print(f"Fixed {res.modified_count} ai_processing videos.")

    # reset processing to approved (youtube upload)
    res2 = client['mwarex']['videos'].update_many(
        {'status': 'processing'},
        {'$set': {'status': 'approved', 'rejectionReason': 'YouTube Queue Interrupted'}}
    )
    print(f"Fixed {res2.modified_count} processing videos.")
else:
    print("MONGO_URI not found")
