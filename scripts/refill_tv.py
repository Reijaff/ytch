import scraptube
from tinydb import TinyDB
import logging
import json
import random
import time
import os

# Centralize database initialization and handling
def initialize_database(db_path):
    """Initializes a database, ensuring it's empty."""
    if os.path.exists(db_path):
        os.remove(db_path)  # Clear existing data
    return TinyDB(db_path)


# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def parse_db_to_channel(db):
    """
    Parses the database, shuffles videos, and creates a playlist with playAt times.
    """
    logging.info("Starting database parsing...")
    videos = []
    current_time = int(time.time())

    for i, v in enumerate(db.all(), 1):
        vid = v.get("videoId")
        if not vid:
            logging.warning(f"Skipping video at index {i} due to missing ID.")
            continue

        # Extract duration, handling potential missing data
        dur_text = v.get("lengthText", {}).get("simpleText")
        dur = 0
        if dur_text:
            dur = sum(int(x) * 60**i for i, x in enumerate(reversed(dur_text.split(":"))))

        videos.append({
            "id": vid,
            "title": v.get("title", {}).get("runs", [{}])[0].get("text"),
            "duration": dur,
        })

    random.shuffle(videos)  # Shuffle for randomized playback

    playlist = {}
    for i, video in enumerate(videos, 1):
        playlist[str(i)] = {
            **video,
            "playAt": current_time,
        }
        current_time += video["duration"]

    logging.info("Database parsing completed.")
    return playlist

def parse_videos(videos_generator, db):
    """
    Parses videos from a generator and stores them in the database.
    """
    for video in videos_generator:
        db.insert(video)
        title = video.get("title", {}).get("runs", [{}])[0].get("text", "Unknown Title")
        print(title)  # Provide feedback during parsing

def parse_channel_videos(channel_username=None, limit=None, mydb=None):
    """Parses videos from a YouTube channel."""
    videos_generator = scraptube.get_channel(
        channel_username=channel_username,
        limit=limit,
    )
    parse_videos(videos_generator, mydb)


def parse_playlist_videos(playlist_id, limit=None, mydb=None):
    """Parses videos from a YouTube playlist."""
    videos_generator = scraptube.get_playlist(playlist_id=playlist_id, limit=limit)
    parse_videos(videos_generator, mydb)


list_json = {}

# 1
db_1 = initialize_database("./db/ch1.json")
parse_channel_videos(channel_username="BrightWorksTV", limit=70, mydb=db_1) # bar brightworks tv
parse_playlist_videos("PL9ijWAhxNikKT4g5qPnsGzKN-ZJjMheyr",limit=50, mydb=db_1) # bar requiem tv
list_json["1"] = parse_db_to_channel(db_1)

# 2
db_2 = initialize_database("./db/ch2.json")
parse_channel_videos(channel_username="Ar-BARon", limit=30, mydb=db_2) # bar arbaron
parse_channel_videos(channel_username="lostdeadmanthree", limit=100, mydb=db_2) # bar lostdeadman
parse_channel_videos(channel_username="dskinnerify", limit=20, mydb=db_2) # bar dskinnerify
list_json["2"] = parse_db_to_channel(db_2)

# 3
db_3 = initialize_database("./db/ch3.json")
parse_playlist_videos("PLD2MrnSI-2rphxMVOL9xSpntrIPnIcu_H", mydb=db_3) # gaming soundtrack
list_json["3"] = parse_db_to_channel(db_3)

# 4
db_4 = initialize_database("./db/ch4.json")
parse_playlist_videos("PLf1MgnzRUat_MEw20ESJAL4IdWt-Ol5Aq", limit=50, mydb=db_4) # aoe4 drongo
parse_playlist_videos("PLhtm1GekY31I3BcJXNWNxMQGui49NUiEE", limit=50, mydb=db_4) # aoe4 farm man off
list_json["4"] = parse_db_to_channel(db_4)

# 5
db_5 = initialize_database("./db/ch5.json")
parse_channel_videos(channel_username="T90Official", limit=70, mydb=db_5) # aoe2 T90Official 
list_json["5"] = parse_db_to_channel(db_5)




# Write the playlist to a file
with open("list.json", "w") as f:
    json.dump(list_json, f)