import scraptube
from tinydb import TinyDB
import logging
import json

import time
from datetime import datetime

# Centralize database initialization
db_channels = TinyDB("ch1.json")
db_playlists = TinyDB("ch3.json")


logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


def parse_db_to_playlist(db):
    logging.info("Starting database parsing...")
    playlist = {}
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

        playlist[str(i)] = {
            "id": vid,
            "title": v.get("title", {}).get("runs", [{}])[0].get("text"),
            "playAt": current_time,  #  + dur,  # Calculate playAt
            "duration": dur,
        }

        current_time += dur  # Increment for the next video

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


def parse_channel_videos(channel_username=None, limit=None):
    """Parses videos from a YouTube channel."""
    videos_generator = scraptube.get_channel(
        channel_username=channel_username,
        limit=limit,
    )
    parse_videos(videos_generator, db_channels)


def parse_playlist_videos(playlist_id, limit=None):
    """Parses videos from a YouTube playlist."""
    videos_generator = scraptube.get_playlist(playlist_id=playlist_id, limit=limit)
    parse_videos(videos_generator, db_playlists)


# Example usage
# parse_channel_videos(channel_username="BrightWorksTV", limit=20)
# parse_playlist_videos("PLJCXrsW_esBlb1BYfeNhY4kJQuNYoDpF_")


# Example Usage:
list_json = {}
ch1_data = parse_db_to_playlist(db_channels)  # Or use db_playlists
ch3_data = parse_db_to_playlist(db_playlists)  # Or use db_playlists

list_json["1"] = ch1_data
list_json["2"] = ch3_data


# json.dumps(list_json))

open("mlist.json", "w").write(json.dumps(list_json))
