### YTCH - Your Custom TV

I was inspired by [https://ytch.xyz](https://ytch.xyz) and decided to make my own custom RTS/gaming streaming front end. I've hosted it on GitHub for everyone to check out: [https://reijaff.github.io/ytch/](https://reijaff.github.io/ytch/)

Currently streaming channels include:


* Beyond all reason commentary
* Beyond all reason playthrough
* Music
* Aoe4 commentary
* Aoe2 commentary
* Game trailers
* Starcraft 2 commentary
* Starcraft commentary

Feel free to give it a try and let me know what you think!

### Features

* Simulates a retro TV interface for streaming YouTube content
* Curated channels for RTS/gaming content
* Customizable channel lineup (edit `refill_tv.py`)
* Minimalist controls for a focused viewing experience

### Installation

1. Clone the repository: `git clone https://github.com/your-username/ytch.git`
2. Install dependencies: `pip install -r requirements.txt`
3. Configure your channel lineup in `refill_tv.py`

### Usage

1. Run the scraper: `python scripts/refill_tv.py`
2. Open `index.html` in your browser

### Controls

* **Power button**: Turns the TV on/off
* **Channel Up/Down**: Switches between channels
* **Volume Up/Down**: Adjusts the volume
* **Mute**: Toggles mute
* **Info**: Displays support information
* **Guide**: Shows the channel guide

### Configuration

* Customize the channel lineup by editing the `parse_channel_videos` and `parse_playlist_videos` functions in `refill_tv.py`.
* You can add specific YouTube channels or playlists, and set limits on the number of videos fetched.

### Contributing

Feel free to fork the project and submit pull requests.

### Testing

Open `index.html` in your browser and test the functionality.

### License

This project is licensed under the MIT License.

### Acknowledgements

* Inspired by [https://ytch.xyz](https://ytch.xyz)
* Uses the `scraptube` library for fetching YouTube data
* Built with HTML, CSS, and JavaScript

Please let me know if you have any other questions.