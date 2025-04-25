/**
 * Script for Plain HTML Video Player with Native Controls and Dark Theme
 * Includes:
 * - URL and Subtitle Input Handling
 * - Dynamic Subtitle Track Addition
 * - Resume Playback Logic (Save on 'timeupdate', Load from localStorage)
 * - Attempt to set Hindi audio track by default
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

            // --- Event Handler for when video is ready ---
            const canPlayHandler = () => {
                console.log("'canplay' event fired.");

                // 1. Attempt to Resume Playback
                if (shouldResume && resumeTime < videoPlayer.duration) {
                    videoPlayer.currentTime = resumeTime;
                    console.log(`Resumed playback at ${resumeTime.toFixed(2)}s`);
                    // Removed alert, as it might be annoying
                    // alert(`Resuming from ${formatTime(resumeTime)}`);
                }

                // --- START OF HIGHLIGHTED CHANGE: Attempt to set default Hindi audio track ---
                try {
                    const audioTracks = videoPlayer.audioTracks;
                    // Check if the browser supports audioTracks and if there's more than one track
                    if (audioTracks && audioTracks.length > 1) {
                        console.log(`[Audio Logic] Found ${audioTracks.length} audio tracks.`);
                        let hindiTrackIndex = -1; // Initialize index for Hindi track
                        // Find the Hindi track index by checking language code or label
                        for (let i = 0; i < audioTracks.length; i++) {
                            const track = audioTracks[i];
                            console.log(`[Audio Logic] Checking Track ${i}: Lang='${track.language}', Label='${track.label}'`);
                            // Check standard language code 'hi' or label containing 'Hindi' (case-insensitive)
                            if (track.language === 'hi' || (track.label && track.label.toLowerCase().includes('hindi'))) {
                                hindiTrackIndex = i; // Found the Hindi track
                                console.log(`[Audio Logic] Found potential Hindi track at index ${i}`);
                                break; // Stop searching
                            }
                        }

                        // If a Hindi track was found, enable it and disable all others
                        if (hindiTrackIndex !== -1) {
                            console.log(`[Audio Logic] Enabling track ${hindiTrackIndex} and disabling others.`);
                            for (let i = 0; i < audioTracks.length; i++) {
                                // Set the 'enabled' property to select the track
                                audioTracks[i].enabled = (i === hindiTrackIndex);
                            }
                            // Optional: Short delay then verify which track is enabled (for debugging)
                             setTimeout(() => {
                                 for (let i = 0; i < audioTracks.length; i++) {
                                     if(audioTracks[i].enabled) console.log(`[Audio Logic] Verification: Track ${i} is now enabled.`);
                                 }
                             }, 100);

                        } else {
                            // Log if no specific Hindi track was identified
                            console.log('[Audio Logic] Hindi audio track not found.');
                        }
                    } else if (audioTracks && audioTracks.length <= 1) {
                         // Log if only one track exists (no selection needed)
                         console.log('[Audio Logic] Only one or zero audio tracks detected. No selection needed.');
                    } else {
                        // Log if the audioTracks API isn't supported or no tracks exist
                        console.log('[Audio Logic] audioTracks API not supported or no tracks found.');
                    }
                } catch (e) {
                    // Log any errors during the audio track selection process
                    console.error("[Audio Logic] Error accessing or setting audio tracks:", e);
                }
                // --- END OF HIGHLIGHTED CHANGE ---

                // Remove this listener after it runs once to avoid redundant executions
                videoPlayer.removeEventListener('canplay', canPlayHandler);
            };
            // --- End Event Handler ---

            // Add the event listener to run the handler when the video is ready
            videoPlayer.addEventListener('canplay', canPlayHandler);

            // --- Load and Play ---
            videoPlayer.load(); // Load the new source and tracks
            videoPlayer.play().catch(error => { // Attempt to play automatically
                console.warn("Autoplay prevented:", error);
                // User may need to click the native play button
            });

            // --- Attach Time Update Listener for Saving ---
            // Ensure only one listener is active by removing any previous ones first
            videoPlayer.removeEventListener('timeupdate', saveResumeTime);
            videoPlayer.addEventListener('timeupdate', saveResumeTime);

            // --- Attach Ended Listener for Cleanup ---
            // Ensure only one listener is active
            videoPlayer.removeEventListener('ended', clearResumeTime);
            videoPlayer.addEventListener('ended', clearResumeTime);

        } else {
            // Alert user if the URL input is empty
            alert('Please enter a valid video URL');
        }
    }

    // --- Save Resume Time on Time Update ---
    function saveResumeTime() {
        // Save only if playback has started, video metadata is ready, not ended, and source URL is valid
        if (videoPlayer.currentTime > 0 && videoPlayer.readyState > 0 && !videoPlayer.ended && videoPlayer.currentSrc) {
            try {
                // Save current time to localStorage using the source URL as part of the key
                localStorage.setItem(RESUME_KEY_PREFIX + videoPlayer.currentSrc, videoPlayer.currentTime);
            } catch (e) {
                // Handle potential storage errors (e.g., storage full)
                console.error("Error saving time to localStorage:", e);
                // Stop trying to save if an error occurs
                videoPlayer.removeEventListener('timeupdate', saveResumeTime);
            }
        }
    }

    // --- Clear Resume Time on Video End ---
    function clearResumeTime() {
        console.log("Video ended. Clearing saved time.");
        // Remove the saved time from localStorage if the source URL is valid
        if (videoPlayer.currentSrc) {
             localStorage.removeItem(RESUME_KEY_PREFIX + videoPlayer.currentSrc);
        }
        // Stop listening for time updates after the video has ended
        videoPlayer.removeEventListener('timeupdate', saveResumeTime);
    }

    // --- Removed loadTracks function ---
    // --- Removed formatTime function ---
    // --- Removed global control functions (playVideo, pauseVideo, etc.) ---

}); // End of DOMContentLoaded
