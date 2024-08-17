import scraptube
from tinydb import TinyDB
import logging
import json
import random

import time
from datetime import datetime

# Centralize database initialization
db_1 = TinyDB("ch1.json")
db_2 = TinyDB("ch2.json")
db_3 = TinyDB("ch3.json")


logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


def parse_db_to_channel(db):
    logging.info("Starting database parsing...")
    videos = []  # Store videos in a list for shuffling
    current_time = int(time.time())

    for i, v in enumerate(db.all(), 1):
        vid = v.get("videoId")
        if not vid:
            logging.warning(f"Skipping video at index {i} due to missing ID.")
            continue

        dur_text = v.get("lengthText", {}).get("simpleText")
        dur = (
            sum(int(x) * 60**i for i, x in enumerate(reversed(dur_text.split(":"))))
            if dur_text
            else 0
        )

        videos.append({
            "id": vid,
            "title": v.get("title", {}).get("runs", [{}])[0].get("text"),
            "duration": dur,
        })

    # Shuffle the videos
    random.shuffle(videos)

    # Assign playAt times after shuffling
    playlist = {}
    for i, video in enumerate(videos, 1):
        playlist[str(i)] = {
            **video,  # Include id, title, duration
            "playAt": current_time,
        }
        current_time += video["duration"]

    logging.info("Database parsing completed.")
    return playlist



def parse_videos(videos_generator, db):
    """
    Parses videos from a generator and stores them in the database, printing titles.
    """
    for video in videos_generator:
        db.insert(video)
        title = video["title"]["runs"][0]["text"]
        print(title)


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

# Example usage
parse_channel_videos(channel_username="BrightWorksTV", limit=100, mydb=db_1) # brightworks tv
parse_playlist_videos("PL9ijWAhxNikKT4g5qPnsGzKN-ZJjMheyr",limit=100, mydb=db_1) # requiem tv

parse_channel_videos(channel_username="Ar-BARon", limit=30, mydb=db_2) # arbaron
parse_channel_videos(channel_username="lostdeadmanthree", limit=100, mydb=db_2) # lostdeadman
parse_channel_videos(channel_username="dskinnerify", limit=None, mydb=db_2) # dskinnerify

parse_playlist_videos("PLJCXrsW_esBlb1BYfeNhY4kJQuNYoDpF_", mydb=db_3) # gaming soundtrack

# Example Usage:
list_json = {}
ch1_data = parse_db_to_channel(db_1)
ch2_data = parse_db_to_channel(db_2)
ch3_data = parse_db_to_channel(db_3)

list_json["1"] = ch1_data
list_json["2"] = ch2_data
list_json["3"] = ch3_data

open("list.json", "w").write(json.dumps(list_json))