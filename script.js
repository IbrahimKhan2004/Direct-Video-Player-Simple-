/**
 * Script for movi-player (moviplayer.com) based Video Player
 * Includes:
 * - URL Input Handling
 * - Local Subtitle File Input Handling (added via movi-player addSubtitleFile)
 * - Resume Playback Logic (Save on 'timeupdate', Load from localStorage)
 * - Attempt to set Hindi audio track by default (getAudioLangs / selectAudioLang)
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const videoPlayer = document.getElementById('videoPlayer');
    const videoUrlInput = document.getElementById('videoUrl');
    const subtitleSwitch = document.getElementById('subtitle-switch');
    // Get reference to the subtitle file input element
    const subtitleFileInput = document.getElementById('subtitle-file');
    const loadVideoButton = document.getElementById('load-video-button');
    // Removed references to audio/subtitle select elements

    const RESUME_KEY_PREFIX = 'htmlVideoResume_'; // Unique prefix


    // --- Subtitle Input Toggle ---
    subtitleSwitch.addEventListener('change', () => {
        // Toggle the visibility of the file input based on the switch state
        subtitleFileInput.style.display = subtitleSwitch.checked ? 'block' : 'none';
        // Clear the file input if the switch is turned off to avoid confusion
        if (!subtitleSwitch.checked) {
            subtitleFileInput.value = ''; // Resets the file selection
        }
    });

    // --- Load Video Button Action ---
    loadVideoButton.addEventListener('click', loadVideo);

    // --- Core Video Loading Function ---
    function loadVideo() {
        const url = videoUrlInput.value.trim();
        // Get the File object from the file input, if one is selected
        const subtitleFile = subtitleFileInput.files[0];
        const useSubtitles = subtitleSwitch.checked;

        console.log(`Attempting to load video: ${url}`);
        if (!customElements.get('movi-player')) {
            alert('Player is still loading. Please try again in a moment.');
            return;
        }
        if (url) {
            videoPlayer.src = url; // Set the main video source (movi-player loads it automatically)

            // Local subtitle is attached after the video's tracks are ready (see loadeddata handler)
            const pendingSubtitle = (useSubtitles && subtitleFile) ? subtitleFile : null;
            if (useSubtitles && !subtitleFile) {
                 // Log a warning if the user enabled subtitles but didn't select a file
                 console.warn("Subtitle toggle is on, but no subtitle file was selected.");
            }

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
                console.log("'loadeddata' event fired.");

                // 1. Attempt to Resume Playback
                if (shouldResume && resumeTime < videoPlayer.duration) {
                    videoPlayer.currentTime = resumeTime;
                    console.log(`Resumed playback at ${resumeTime.toFixed(2)}s`);
                }

                // 2. Attempt to set default Hindi audio track
                try {
                    const langs = videoPlayer.getAudioLangs ? videoPlayer.getAudioLangs() : [];
                    if (langs.length > 1) {
                        const hindi = langs.find(t => /^(hi|hin)$/i.test(t.lang) || (t.label && t.label.toLowerCase().includes('hindi')));
                        if (hindi && !hindi.active) {
                            videoPlayer.selectAudioLang(hindi.lang);
                            console.log(`[Audio Logic] Switched to Hindi track (${hindi.lang}).`);
                        }
                    }
                } catch (e) {
                    console.error("[Audio Logic] Error accessing or setting audio tracks:", e);
                }

                // 3. Attach the local subtitle file, if any
                if (pendingSubtitle) {
                    const label = pendingSubtitle.name.replace(/\.[^/.]+$/, "") || 'Local Subtitle';
                    videoPlayer.addSubtitleFile(pendingSubtitle, label).catch(e => {
                        console.error("Error adding subtitle file:", e);
                        alert(`Failed to load subtitle file: ${e.message}`);
                    });
                }

                // 4. Make sure playback has started
                if (videoPlayer.paused) videoPlayer.play().catch(() => {});

                // Remove this listener after it runs once
                videoPlayer.removeEventListener('loadeddata', canPlayHandler);
            };
            // --- End Event Handler ---

            videoPlayer.addEventListener('loadeddata', canPlayHandler);

            // --- Load and Play ---
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

}); // End of DOMContentLoaded
