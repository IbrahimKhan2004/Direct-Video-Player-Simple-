/**
 * Script for Plain HTML Video Player with Native Controls and Dark Theme
 * Includes:
 * - URL and Subtitle Input Handling
 * - Dynamic Subtitle Track Addition
 * - Resume Playback Logic (Save on 'timeupdate', Load from localStorage)
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const videoPlayer = document.getElementById('videoPlayer');
    const videoUrlInput = document.getElementById('videoUrl');
    const subtitleSwitch = document.getElementById('subtitle-switch');
    const subtitleUrlInput = document.getElementById('subtitle-url');
    const loadVideoButton = document.getElementById('load-video-button');
    // Removed references to audio/subtitle select elements

    const RESUME_KEY_PREFIX = 'htmlVideoResume_'; // Unique prefix

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
            const existingTracks = videoPlayer.querySelectorAll('track');
            existingTracks.forEach(track => track.remove());
            // --- End Clear ---

            videoPlayer.src = url; // Set the main video source

            // --- Dynamically add subtitle track if requested ---
            if (useSubtitles && subUrl) {
                try {
                    const trackElement = document.createElement('track');
                    trackElement.kind = 'subtitles';
                    trackElement.label = 'Custom Subtitles';
                    trackElement.srclang = 'en';
                    trackElement.src = subUrl;
                    // Let the browser decide if it's default based on its logic or user settings
                    // trackElement.default = true;
                    videoPlayer.appendChild(trackElement);
                    console.log(`Added subtitle track: ${subUrl}`);
                } catch (e) {
                    console.error("Error adding subtitle track:", e);
                }
            }
            // --- End Subtitle Add ---

            // --- Resume Logic ---
            const savedTime = localStorage.getItem(RESUME_KEY_PREFIX + url);
            let shouldResume = false;
            let resumeTime = 0;
            if (savedTime) {
                resumeTime = parseFloat(savedTime);
                if (!isNaN(resumeTime) && resumeTime > 0) {
                    shouldResume = true;
                    console.log(`Found saved time: ${resumeTime}. Will attempt to resume.`);
                } else {
                    console.warn(`Invalid saved time found: ${savedTime}. Ignoring.`);
                    localStorage.removeItem(RESUME_KEY_PREFIX + url);
                }
            }
            // --- End Resume Check ---

            // Use 'canplay' event to set resume time
            const canPlayHandler = () => {
                console.log("'canplay' event fired.");
                if (shouldResume && resumeTime < videoPlayer.duration) {
                    videoPlayer.currentTime = resumeTime;
                    console.log(`Resumed playback at ${resumeTime.toFixed(2)}s`);
                    // Removed alert, as it might be annoying
                    // alert(`Resuming from ${formatTime(resumeTime)}`);
                }
                // Removed call to loadTracks() as dropdowns are gone
                videoPlayer.removeEventListener('canplay', canPlayHandler);
            };
            videoPlayer.addEventListener('canplay', canPlayHandler);

            // --- Load and Play ---
            videoPlayer.load();
            videoPlayer.play().catch(error => {
                console.warn("Autoplay prevented:", error);
            });

            // --- Attach Time Update Listener for Saving ---
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
        if (videoPlayer.currentTime > 0 && videoPlayer.readyState > 0 && !videoPlayer.ended && videoPlayer.currentSrc) {
            try {
                localStorage.setItem(RESUME_KEY_PREFIX + videoPlayer.currentSrc, videoPlayer.currentTime);
            } catch (e) {
                console.error("Error saving time to localStorage:", e);
                videoPlayer.removeEventListener('timeupdate', saveResumeTime);
            }
        }
    }

    // --- Clear Resume Time on Video End ---
    function clearResumeTime() {
        console.log("Video ended. Clearing saved time.");
        if (videoPlayer.currentSrc) {
             localStorage.removeItem(RESUME_KEY_PREFIX + videoPlayer.currentSrc);
        }
        videoPlayer.removeEventListener('timeupdate', saveResumeTime);
    }

    // --- Removed loadTracks function ---
    // --- Removed formatTime function (no longer used by alerts) ---
    // --- Removed global control functions (playVideo, pauseVideo, etc.) ---

}); // End of DOMContentLoaded
