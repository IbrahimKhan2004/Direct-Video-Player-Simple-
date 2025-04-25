/**
 * Script for Plain HTML Video Player with Native Controls and Dark Theme
 * Includes:
 * - URL Input Handling
 * - Local Subtitle File Input Handling
 * - Dynamic Subtitle Track Addition using Object URL
 * - Resume Playback Logic (Save on 'timeupdate', Load from localStorage)
 * - Attempt to set Hindi audio track by default
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const videoPlayer = document.getElementById('videoPlayer');
    const videoUrlInput = document.getElementById('videoUrl');
    const subtitleSwitch = document.getElementById('subtitle-switch');
    // --- START OF HIGHLIGHTED CHANGE: Get file input reference ---
    // Get reference to the new file input element
    const subtitleFileInput = document.getElementById('subtitle-file');
    // --- END OF HIGHLIGHTED CHANGE ---
    const loadVideoButton = document.getElementById('load-video-button');
    // Removed references to audio/subtitle select elements

    const RESUME_KEY_PREFIX = 'htmlVideoResume_'; // Unique prefix
    // --- START OF HIGHLIGHTED CHANGE: Variable to store the current object URL ---
    // Keep track of the generated object URL for the subtitle file to allow cleanup
    let currentSubtitleObjectURL = null;
    // --- END OF HIGHLIGHTED CHANGE ---


    // --- Subtitle Input Toggle ---
    subtitleSwitch.addEventListener('change', () => {
        // --- START OF HIGHLIGHTED CHANGE: Show/hide file input ---
        // Toggle the visibility of the file input based on the switch state
        subtitleFileInput.style.display = subtitleSwitch.checked ? 'block' : 'none';
        // Clear the file input if the switch is turned off to avoid confusion
        if (!subtitleSwitch.checked) {
            subtitleFileInput.value = ''; // Resets the file selection
        }
        // --- END OF HIGHLIGHTED CHANGE ---
    });

    // --- Load Video Button Action ---
    loadVideoButton.addEventListener('click', loadVideo);

    // --- Core Video Loading Function ---
    function loadVideo() {
        const url = videoUrlInput.value.trim();
        // --- START OF HIGHLIGHTED CHANGE: Get selected file ---
        // Get the File object from the file input, if one is selected
        const subtitleFile = subtitleFileInput.files[0];
        // --- END OF HIGHLIGHTED CHANGE ---
        const useSubtitles = subtitleSwitch.checked;

        console.log(`Attempting to load video: ${url}`);
        if (url) {
            // --- START OF HIGHLIGHTED CHANGE: Revoke previous object URL ---
            // Before creating a new object URL, revoke the old one if it exists
            // This prevents memory leaks by releasing the reference to the previous file blob
            if (currentSubtitleObjectURL) {
                URL.revokeObjectURL(currentSubtitleObjectURL);
                console.log(`Revoked previous subtitle object URL: ${currentSubtitleObjectURL}`);
                currentSubtitleObjectURL = null; // Reset the variable
            }
            // --- END OF HIGHLIGHTED CHANGE ---

            // --- Clear existing tracks before setting new source ---
            const existingTracks = videoPlayer.querySelectorAll('track');
            existingTracks.forEach(track => track.remove());
            // --- End Clear ---

            videoPlayer.src = url; // Set the main video source

            // --- START OF HIGHLIGHTED CHANGE: Dynamically add subtitle track from local file ---
            // Proceed only if the subtitle switch is checked AND a file was actually selected
            if (useSubtitles && subtitleFile) {
                try {
                    // Create a temporary local URL (blob URL) representing the selected file
                    currentSubtitleObjectURL = URL.createObjectURL(subtitleFile);
                    console.log(`Created subtitle object URL: ${currentSubtitleObjectURL} for file: ${subtitleFile.name}`);

                    // Create a new <track> element for the subtitles
                    const trackElement = document.createElement('track');
                    trackElement.kind = 'subtitles';
                    // Use the filename (without extension) as a label, fallback to generic label
                    trackElement.label = subtitleFile.name.replace(/\.[^/.]+$/, "") || 'Local Subtitle';
                    trackElement.srclang = 'en'; // Default language code (can be changed or detected)
                    trackElement.src = currentSubtitleObjectURL; // Set the source to the generated object URL
                    // trackElement.default = true; // Let browser/user choose default track

                    // Append the new track element to the video player
                    videoPlayer.appendChild(trackElement);
                    console.log(`Added subtitle track from local file: ${subtitleFile.name}`);

                } catch (e) {
                    // Handle errors during object URL creation or element manipulation
                    console.error("Error creating object URL or adding subtitle track:", e);
                    alert(`Failed to load subtitle file: ${e.message}`);
                    // Ensure the object URL variable is reset if an error occurred
                    currentSubtitleObjectURL = null;
                }
            } else if (useSubtitles && !subtitleFile) {
                 // Log a warning if the user enabled subtitles but didn't select a file
                 console.warn("Subtitle toggle is on, but no subtitle file was selected.");
                 // Optionally alert the user
                 // alert("Please select a subtitle file (.vtt) if you want to add subtitles.");
            }
            // --- END OF HIGHLIGHTED CHANGE ---

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
                }

                // 2. Attempt to set default Hindi audio track
                try {
                    const audioTracks = videoPlayer.audioTracks;
                    if (audioTracks && audioTracks.length > 1) {
                        console.log(`[Audio Logic] Found ${audioTracks.length} audio tracks.`);
                        let hindiTrackIndex = -1;
                        for (let i = 0; i < audioTracks.length; i++) {
                            const track = audioTracks[i];
                            console.log(`[Audio Logic] Checking Track ${i}: Lang='${track.language}', Label='${track.label}'`);
                            if (track.language === 'hi' || (track.label && track.label.toLowerCase().includes('hindi'))) {
                                hindiTrackIndex = i;
                                console.log(`[Audio Logic] Found potential Hindi track at index ${i}`);
                                break;
                            }
                        }
                        if (hindiTrackIndex !== -1) {
                            console.log(`[Audio Logic] Enabling track ${hindiTrackIndex} and disabling others.`);
                            for (let i = 0; i < audioTracks.length; i++) {
                                audioTracks[i].enabled = (i === hindiTrackIndex);
                            }
                             setTimeout(() => {
                                 for (let i = 0; i < audioTracks.length; i++) {
                                     if(audioTracks[i].enabled) console.log(`[Audio Logic] Verification: Track ${i} is now enabled.`);
                                 }
                             }, 100);
                        } else {
                            console.log('[Audio Logic] Hindi audio track not found.');
                        }
                    } else if (audioTracks && audioTracks.length <= 1) {
                         console.log('[Audio Logic] Only one or zero audio tracks detected. No selection needed.');
                    } else {
                        console.log('[Audio Logic] audioTracks API not supported or no tracks found.');
                    }
                } catch (e) {
                    console.error("[Audio Logic] Error accessing or setting audio tracks:", e);
                }

                // Remove this listener after it runs once
                videoPlayer.removeEventListener('canplay', canPlayHandler);
            };
            // --- End Event Handler ---

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

    // --- START OF HIGHLIGHTED CHANGE: Add cleanup for object URL on page unload ---
    // Add an event listener to revoke the object URL when the page is closed or navigated away from
    // This is important for releasing memory associated with the blob URL
    window.addEventListener('beforeunload', () => {
        if (currentSubtitleObjectURL) {
            URL.revokeObjectURL(currentSubtitleObjectURL);
            console.log(`Revoked subtitle object URL on page unload: ${currentSubtitleObjectURL}`);
        }
    });
    // --- END OF HIGHLIGHTED CHANGE ---


}); // End of DOMContentLoaded
