import tkinter as tk
from datetime import datetime
import threading, time, math
from pprint import pprint

####################################
# Times
####################################

# Starting times for sessions
# These are for Sha Tin College 2019/2020 - change to suit your needs

times = [
    { "session": "Staff mtg",   "time": "08:05" },
    { "session": "Tutor",       "time": "08:15" },
    { "session": "(go to p1)",  "time": "08:35" },
    { "session": "Period 1",    "time": "08:40" },
    { "session": "(go to p2)",  "time": "09:43" },
    { "session": "Period 2",    "time": "09:47" },
    { "session": "Break",       "time": "10:50" },
    { "session": "Period 3",    "time": "11:15" },
    { "session": "Lunch",       "time": "12:18" },
    { "session": "Period 4",    "time": "13:10" },
    { "session": "(go to p5)",  "time": "14:13" },
    { "session": "Period 5",    "time": "14:17" },
    { "session": "Go home!",    "time": "15:20" },
]

ORANGE_ALERT = 300  # seconds
RED_ALERT = 180     # seconds
ORANGE_COLOR = "#dd8304"
RED_COLOR = "#dd0404"
NORMAL_COLOR = "#000000"

####################################
# Intialise
####################################

class TimerApp():
    def __init__(self, parent, times):
        self.window = parent
        self.times = times
        self.keep_ticking = True
        self.window.title("Classroom timer by Paul Baumgarten")
        self.window.geometry("180x120")
        self.window.attributes('-alpha', 0.8)
        self.window.configure(background='black')
        self.window.protocol("WM_DELETE_WINDOW", self.close)
        # Labels
        self.session = tk.Label(self.window, text="(no session)")
        self.session.config(fg="white", background='black', font=("Arial", 28))
        self.session.place(x=5, y=20)
        self.remaining = tk.Label(self.window, text="00:00:00")
        self.remaining.config(fg="white", background='black', font=("Courier", 32))
        self.remaining.place(x=5, y=75)
        self.label1 = tk.Label(self.window, text="Current session")
        self.label1.config(fg="white", background='black', font=("Arial", 11))
        self.label1.place(x=5, y=5)
        self.label2 = tk.Label(self.window, text="Time remaining")
        self.label2.config(fg="white", background='black', font=("Arial", 11))
        self.label2.place(x=5, y=60)

    def set_background(self, bgcolor):
        self.window.configure(background=bgcolor)
        self.label1.config(background=bgcolor)
        self.label2.config(background=bgcolor)
        self.session.config(background=bgcolor)
        self.remaining.config(background=bgcolor)
        
    def set_display(self, session_label, session_text, time_str):
        self.label1["text"] = session_label
        self.session["text"] = session_text
        self.remaining["text"] = time_str
    
    def close(self):
        self.keep_ticking = False
        self.window.quit()
    
    def tick(self):
        now = datetime.now()
        seconds_since_midnight = (now - now.replace(hour=0, minute=0, second=0, microsecond=0)).total_seconds()
        current_session = 0
        while (current_session < len(self.times)) and (seconds_since_midnight > self.times[current_session]["seconds"]):
            current_session += 1 
        if current_session < len(times):
            # Day is not over
            seconds_remaining = self.times[current_session]["seconds"] - seconds_since_midnight
            h = int(seconds_remaining // 3600)
            m = int((seconds_remaining % 3600) // 60)
            s = int(seconds_remaining % 60)
            if seconds_remaining < RED_ALERT:
                self.set_background(RED_COLOR)
                self.label1["text"] = "Up next..."
                self.label2["text"] = "Time remaining..."
                self.session["text"] = self.times[current_session]["session"]
                self.remaining["text"] = f"{h:02d}:{m:02d}:{s:02d}"
            elif seconds_remaining < ORANGE_ALERT:
                self.set_background(ORANGE_COLOR)
                self.label1["text"] = "Up next..."
                self.label2["text"] = "Time remaining..."
                self.session["text"] = self.times[current_session]["session"]
                self.remaining["text"] = f"{h:02d}:{m:02d}:{s:02d}"
            else:
                self.set_background(NORMAL_COLOR)
                self.label1["text"] = "Current session..."
                self.label2["text"] = "Time remaining..."
                if current_session == 0:
                    self.session["text"] = "(prep time)"
                else:
                    self.session["text"] = self.times[current_session-1]["session"]
                self.remaining["text"] = f"{h:02d}:{m:02d}:{s:02d}"
        elif current_session == len(times):
            # Day has finished
            self.set_background(NORMAL_COLOR)
            self.label1["text"] = ""
            self.label2["text"] = "Current time..."
            self.session["text"] = self.times[current_session-1]["session"]
            time_str = now.strftime("%H:%M:%S")
            self.remaining["text"] = time_str
        else:
            print("?????")
        # Queue up the next thread tick
        if self.keep_ticking:
            threading.Timer(1, self.tick).start()

####################################
# Main
####################################

if __name__ == "__main__":
    # Process times data
    for i in range(len(times)):
        start_time_str = times[i]["time"]
        start_time_parts = start_time_str.split(":")
        start_time_seconds = int(start_time_parts[0])*3600 + int(start_time_parts[1])*60
        times[i]["seconds"] = start_time_seconds
    pprint(times)
    # Create window
    root = tk.Tk()
    root.wm_attributes("-topmost", 1) # this will keep it on top
    timer = TimerApp(root, times)
    ticker = threading.Timer(1, timer.tick).start()
    root.mainloop()
