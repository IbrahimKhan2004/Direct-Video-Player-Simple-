/**
 * Script for Plain HTML Video Player with Custom Controls and Dark Theme
 * Includes:
 * - URL and Subtitle Input Handling
 * - Custom Controls Functionality (Play, Pause, Skip, Speed, Fullscreen, PiP)
 * - Audio/Subtitle Track Selection
 * - Resume Playback Logic (Save on 'timeupdate', Load from localStorage)
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const videoPlayer = document.getElementById('videoPlayer');
    const videoUrlInput = document.getElementById('videoUrl');
    const subtitleSwitch = document.getElementById('subtitle-switch');
    const subtitleUrlInput = document.getElementById('subtitle-url');
    const loadVideoButton = document.getElementById('load-video-button'); // Button to load the video
    const audioTracksSelect = document.getElementById('audioTracks');
    const subtitlesSelect = document.getElementById('subtitles');

    const RESUME_KEY_PREFIX = 'htmlVideoResume_'; // Unique prefix for this player version

    // --- Subtitle Input Toggle ---
    subtitleSwitch.addEventListener('change', () => {
        subtitleUrlInput.style.display = subtitleSwitch.checked ? 'block' : 'none';
        if (!subtitleSwitch.checked) {
            subtitleUrlInput.value = '';
        }
    });

    // --- Load Video Button Action ---
    loadVideoButton.addEventListener('click', loadVideo);

    // --- Core Video Loading Function ---
    function loadVideo() {
        const url = videoUrlInput.value.trim();
        const subUrl = subtitleUrlInput.value.trim();
        const useSubtitles = subtitleSwitch.checked;

        console.log(`Attempting to load video: ${url}`);
        if (url) {
            // --- Clear existing tracks before setting new source ---
            // Remove old subtitle <track> elements manually
            const existingTracks = videoPlayer.querySelectorAll('track');
            existingTracks.forEach(track => track.remove());
            // Reset select dropdowns
            audioTracksSelect.innerHTML = '<option value="">Select Audio Track</option>';
            subtitlesSelect.innerHTML = '<option value="">Select Subtitle</option>';
            // --- End Clear ---

            videoPlayer.src = url; // Set the main video source

            // --- Dynamically add subtitle track if requested ---
            if (useSubtitles && subUrl) {
                try {
                    const trackElement = document.createElement('track');
                    trackElement.kind = 'subtitles';
                    trackElement.label = 'Custom Subtitles'; // Or derive from filename?
                    trackElement.srclang = 'en'; // Default language
                    trackElement.src = subUrl;
                    trackElement.default = true; // Try to make it default
                    videoPlayer.appendChild(trackElement);
                    console.log(`Added subtitle track: ${subUrl}`);
                } catch (e) {
                    console.error("Error adding subtitle track:", e);
                }
            }
            // --- End Subtitle Add ---

            // --- Resume Logic ---
            // Check for saved resume time *before* calling load() or play()
            const savedTime = localStorage.getItem(RESUME_KEY_PREFIX + url);
            let shouldResume = false;
            let resumeTime = 0;
            if (savedTime) {
                resumeTime = parseFloat(savedTime);
                // Basic validation (isNaN check is important)
                if (!isNaN(resumeTime) && resumeTime > 0) {
                    shouldResume = true;
                    console.log(`Found saved time: ${resumeTime}. Will attempt to resume.`);
                    // Don't set currentTime here yet, wait for 'loadedmetadata' or 'canplay'
                } else {
                    console.warn(`Invalid saved time found: ${savedTime}. Ignoring.`);
                    localStorage.removeItem(RESUME_KEY_PREFIX + url); // Clean up invalid entry
                }
            }
            // --- End Resume Check ---

            // Use 'canplay' event to set resume time, as duration might not be ready in 'loadedmetadata' for plain video elements sometimes
            const canPlayHandler = () => {
                console.log("'canplay' event fired.");
                if (shouldResume && resumeTime < videoPlayer.duration) {
                    videoPlayer.currentTime = resumeTime;
                    console.log(`Resumed playback at ${resumeTime.toFixed(2)}s`);
                    alert(`Resuming from ${formatTime(resumeTime)}`); // User feedback
                }
                 // Load audio/subtitle tracks into dropdowns *after* metadata is loaded
                loadTracks();
                // Remove this listener so it doesn't fire again for the same source
                videoPlayer.removeEventListener('canplay', canPlayHandler);
            };
            videoPlayer.addEventListener('canplay', canPlayHandler);


            // --- Load and Play ---
            videoPlayer.load(); // Load the new source and any added tracks
            videoPlayer.play().catch(error => { // Attempt to play
                console.warn("Autoplay prevented:", error);
                // User might need to click the native play button or our custom one
            });

            // --- Attach Time Update Listener for Saving ---
            // Remove previous listener first to avoid duplicates if loadVideo is called again
            videoPlayer.removeEventListener('timeupdate', saveResumeTime);
            videoPlayer.addEventListener('timeupdate', saveResumeTime);

            // --- Attach Ended Listener for Cleanup ---
            videoPlayer.removeEventListener('ended', clearResumeTime);
            videoPlayer.addEventListener('ended', clearResumeTime);

        } else {
            alert('Please enter a valid video URL');
        }
    }

    // --- Save Resume Time on Time Update ---
    function saveResumeTime() {
        // Check currentTime > 0 to avoid saving 0 initially
        // Check readyState > 0 to ensure metadata is loaded enough to have a valid currentTime
        if (videoPlayer.currentTime > 0 && videoPlayer.readyState > 0 && !videoPlayer.ended) {
            try {
                localStorage.setItem(RESUME_KEY_PREFIX + videoPlayer.currentSrc, videoPlayer.currentTime);
                 // console.log(`Saved time: ${videoPlayer.currentTime}`); // Can be very noisy
            } catch (e) {
                console.error("Error saving time to localStorage:", e);
                // Potentially disable saving if storage is full
                videoPlayer.removeEventListener('timeupdate', saveResumeTime);
            }
        }
    }

    // --- Clear Resume Time on Video End ---
    function clearResumeTime() {
        console.log("Video ended. Clearing saved time.");
        if (videoPlayer.currentSrc) { // Ensure we have a source URL
             localStorage.removeItem(RESUME_KEY_PREFIX + videoPlayer.currentSrc);
        }
        // Remove listener when video ends
        videoPlayer.removeEventListener('timeupdate', saveResumeTime);
    }


    // --- Load Audio/Subtitle Tracks into Select Dropdowns ---
    function loadTracks() {
        console.log("Loading tracks into dropdowns...");
        // Clear previous options again just in case
        audioTracksSelect.innerHTML = '<option value="">Select Audio Track</option>';
        subtitlesSelect.innerHTML = '<option value="">Select Subtitle</option>';

        // Handle audio tracks (browser support varies)
        if (videoPlayer.audioTracks && videoPlayer.audioTracks.length > 0) {
            console.log(`Found ${videoPlayer.audioTracks.length} audio tracks.`);
            for (let i = 0; i < videoPlayer.audioTracks.length; i++) {
                const track = videoPlayer.audioTracks[i];
                const option = document.createElement('option');
                option.value = i;
                // Use label or language if available
                option.textContent = track.label || track.language || `Audio Track ${i + 1}`;
                option.selected = track.enabled; // Reflect current state
                audioTracksSelect.appendChild(option);
            }
        } else {
            console.warn("No audio tracks detected or API not supported.");
            audioTracksSelect.disabled = true; // Disable dropdown if no tracks
        }

        // Handle subtitle/text tracks
        if (videoPlayer.textTracks && videoPlayer.textTracks.length > 0) {
            console.log(`Found ${videoPlayer.textTracks.length} text tracks.`);
            subtitlesSelect.disabled = false;
            Array.from(videoPlayer.textTracks).forEach((track, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = track.label || track.language || `Subtitle ${index + 1}`;
                // Set selected if the track is currently showing
                option.selected = track.mode === 'showing';
                subtitlesSelect.appendChild(option);

                // Ensure only one track is showing initially if multiple have 'default'
                 if (track.mode === 'showing' && !option.selected) {
                     track.mode = 'disabled';
                 }
            });
             // Add an option to disable subtitles
             const disableOption = document.createElement('option');
             disableOption.value = "-1"; // Use -1 to signify disabling all
             disableOption.textContent = "Disable Subtitles";
             // Select if no tracks are currently showing
             disableOption.selected = Array.from(videoPlayer.textTracks).every(track => track.mode !== 'showing');
             subtitlesSelect.appendChild(disableOption);

        } else {
            console.warn("No subtitle tracks detected.");
            subtitlesSelect.disabled = true; // Disable dropdown if no tracks
        }
    }

    // --- Utility Function to Format Time ---
    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    // --- Custom Control Functions ---
    // Make these globally accessible OR add event listeners
    window.playVideo = function() { // Renamed from play() to avoid conflict
        videoPlayer.play();
    }
    window.pauseVideo = function() { // Renamed from pause()
        videoPlayer.pause();
    }
    window.toggleFullscreen = function() {
        if (!document.fullscreenElement) {
            // Request fullscreen on the container or player itself
             videoPlayer.requestFullscreen().catch(err => {
                 alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
             });
        } else {
             document.exitFullscreen();
        }
    }
    window.togglePIP = async function() {
        try {
            if (videoPlayer !== document.pictureInPictureElement) {
                await videoPlayer.requestPictureInPicture();
            } else {
                await document.exitPictureInPicture();
            }
        } catch(error) {
            console.error("PiP Error:", error);
            alert("Picture-in-Picture failed. Your browser might not support it or the video source is incompatible.");
        }
    }
    window.skip = function(seconds) {
        videoPlayer.currentTime += seconds;
    }
    window.increaseSpeed = function() {
        // Clamp speed to a reasonable maximum, e.g., 4x
        videoPlayer.playbackRate = Math.min(videoPlayer.playbackRate + 0.1, 4);
        console.log(`Playback speed: ${videoPlayer.playbackRate.toFixed(1)}x`);
    }
    window.decreaseSpeed = function() {
        // Clamp speed to a reasonable minimum, e.g., 0.2x
        videoPlayer.playbackRate = Math.max(videoPlayer.playbackRate - 0.1, 0.2);
         console.log(`Playback speed: ${videoPlayer.playbackRate.toFixed(1)}x`);
    }
    window.changeAudioTrack = function() {
        const trackIndex = parseInt(audioTracksSelect.value, 10);
        if (!isNaN(trackIndex) && videoPlayer.audioTracks) {
            console.log(`Changing audio track to index: ${trackIndex}`);
            for (let i = 0; i < videoPlayer.audioTracks.length; i++) {
                videoPlayer.audioTracks[i].enabled = (i === trackIndex);
            }
        }
    }
    window.changeSubtitle = function() {
        const trackIndex = parseInt(subtitlesSelect.value, 10);
         if (!isNaN(trackIndex) && videoPlayer.textTracks) {
             console.log(`Changing subtitle track to index: ${trackIndex}`);
             Array.from(videoPlayer.textTracks).forEach((track, index) => {
                 // Show the selected track, disable others
                 track.mode = (index === trackIndex) ? 'showing' : 'disabled';
             });
         }
    }

}); // End of DOMContentLoaded
